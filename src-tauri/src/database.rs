use chrono::{DateTime, Utc};
use rusqlite::{Connection, Result as SqliteResult, params};
use serde::{Deserialize, Serialize};
use std::{ptr::null, sync::Mutex};
use uuid::Uuid;

pub const DEFAULT_TASK_LIMIT: i32 = 1000;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Task {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub priority: i32, // 1 = low, 2 = medium, 3 = high
    pub created_at: String,
    pub due_date: Option<String>,
    pub reminder_date: Option<String>,
    pub completed: bool,
    pub completed_at: Option<String>,
    pub position: i32, // for drag & drop ordering
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Label {
    pub id: String,
    pub name: String,
    pub color: String, // hex color
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TaskWithLabels {
    pub task: Task,
    pub labels: Vec<Label>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct TaskFilter {
    pub label_id: Option<String>,
    pub priority: Option<i32>,
    pub completed: Option<bool>,
    pub search: Option<String>,
    pub sort_by: Option<String>,      // "priority", "created_at", "due_date"
    pub sort_order: Option<String>,   // "asc", "desc"
    pub limit: Option<i32>,
}

pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    pub fn new(db_path: &str) -> SqliteResult<Self> {
        let conn = Connection::open(db_path)?;
        let db = Database {
            conn: Mutex::new(conn),
        };
        db.init_schema()?;
        Ok(db)
    }

    fn init_schema(&self) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        
        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                priority INTEGER NOT NULL DEFAULT 2,
                created_at TEXT NOT NULL,
                due_date TEXT,
                reminder_date TEXT,
                completed INTEGER NOT NULL DEFAULT 0,
                completed_at TEXT, 
                position INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS labels (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                color TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS task_labels (
                task_id TEXT NOT NULL,
                label_id TEXT NOT NULL,
                PRIMARY KEY (task_id, label_id),
                FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
                FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
            CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
            CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
            CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);

            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );

            INSERT OR IGNORE INTO settings (key, value) VALUES ('backup_enabled', 'false');
            INSERT OR IGNORE INTO settings (key, value) VALUES ('backup_path', '');
            INSERT OR IGNORE INTO settings (key, value) VALUES ('backup_interval_days', '7');
            INSERT OR IGNORE INTO settings (key, value) VALUES ('last_backup', '');

            "
        )?;
        
        Ok(())
    }

    // Task operations
    pub fn create_task(&self, title: String, description: Option<String>, priority: i32, due_date: Option<String>, reminder_date: Option<String>) -> SqliteResult<Task> {
        let conn = self.conn.lock().unwrap();
        let id = Uuid::new_v4().to_string();
        let created_at = Utc::now().to_rfc3339();
        
        let max_position: i32 = conn
            .query_row("SELECT COALESCE(MAX(position), 0) FROM tasks", [], |row| row.get(0))
            .unwrap_or(0);

        conn.execute(
            "INSERT INTO tasks (id, title, description, priority, created_at, due_date, reminder_date, completed, completed_at, position) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 0, NULL, ?8)",
            params![id, title, description, priority, created_at, due_date, reminder_date, max_position + 1],
        )?;

        Ok(Task {
            id,
            title,
            description,
            priority,
            created_at,
            due_date,
            reminder_date,
            completed: false,
            completed_at: None,
            position: max_position + 1,
        })
    }

    pub fn get_tasks(&self, filter: TaskFilter) -> SqliteResult<Vec<TaskWithLabels>> {
        let conn = self.conn.lock().unwrap();
        
        let limit = filter.limit.unwrap_or(DEFAULT_TASK_LIMIT);
        let sort_by = filter.sort_by.unwrap_or_else(|| "created_at".to_string());
        let sort_order = filter.sort_order.unwrap_or_else(|| "desc".to_string());
        
        // Build query dynamically
        let mut sql = String::from(
            "SELECT DISTINCT t.id, t.title, t.description, t.priority, t.created_at, 
            t.due_date, t.reminder_date, t.completed, t.completed_at, t.position
            FROM tasks t"
        );
        
        let mut conditions: Vec<String> = Vec::new();
        let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
        
        // Join with task_labels if filtering by label
        if filter.label_id.is_some() {
            sql.push_str(" INNER JOIN task_labels tl ON t.id = tl.task_id");
        }
        
        // Label filter
        if let Some(ref label_id) = filter.label_id {
            conditions.push(format!("tl.label_id = ?{}", params.len() + 1));
            params.push(Box::new(label_id.clone()));
        }
        
        // Priority filter
        if let Some(priority) = filter.priority {
            conditions.push(format!("t.priority = ?{}", params.len() + 1));
            params.push(Box::new(priority));
        }
        
        // Completed filter
        if let Some(completed) = filter.completed {
            conditions.push(format!("t.completed = ?{}", params.len() + 1));
            params.push(Box::new(completed as i32));
        }
        
        // Search filter
        if let Some(ref search) = filter.search {
            let search_pattern = format!("%{}%", search);
            conditions.push(format!(
                "(t.title LIKE ?{} OR t.description LIKE ?{})",
                params.len() + 1,
                params.len() + 2
            ));
            params.push(Box::new(search_pattern.clone()));
            params.push(Box::new(search_pattern));
        }
        
        // Add WHERE clause
        if !conditions.is_empty() {
            sql.push_str(" WHERE ");
            sql.push_str(&conditions.join(" AND "));
        }
        
        // Add ORDER BY
        let order_column = match sort_by.as_str() {
            "priority" => "t.priority",
            "due_date" => "t.due_date",
            "created_at" => "t.created_at",
            _ => "t.created_at",
        };
        let order_dir = if sort_order == "asc" { "ASC" } else { "DESC" };
        
        // Handle NULL values in sorting, with priority as secondary sort
        if sort_by == "due_date" {
            sql.push_str(&format!(
                " ORDER BY {} IS NULL, {} {}, t.priority DESC",
                order_column, order_column, order_dir
            ));
        } else if sort_by == "priority" {
            sql.push_str(&format!(
                " ORDER BY {} {}, t.due_date IS NULL, t.due_date ASC",
                order_column, order_dir
            ));
        } else {
            sql.push_str(&format!(" ORDER BY {} {}", order_column, order_dir));
        }
        
        // Add LIMIT
        sql.push_str(&format!(" LIMIT {}", limit));
        
        // Execute query
        let params_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|p| p.as_ref()).collect();
        let mut stmt = conn.prepare(&sql)?;
        
        let tasks: Vec<Task> = stmt.query_map(params_refs.as_slice(), |row| {
            Ok(Task {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                priority: row.get(3)?,
                created_at: row.get(4)?,
                due_date: row.get(5)?,
                reminder_date: row.get(6)?,
                completed: row.get::<_, i32>(7)? != 0,
                completed_at: row.get(8)?,
                position: row.get(9)?,
            })
        })?.filter_map(|r| r.ok()).collect();
        
        drop(stmt);
        
        // Get labels for each task
        let mut result = Vec::new();
        for task in tasks {
            let labels = self.get_labels_for_task_internal(&conn, &task.id)?;
            result.push(TaskWithLabels { task, labels });
        }
        
        Ok(result)
    }

    fn get_labels_for_task_internal(&self, conn: &Connection, task_id: &str) -> SqliteResult<Vec<Label>> {
        let mut stmt = conn.prepare(
            "SELECT l.id, l.name, l.color, l.created_at FROM labels l 
             INNER JOIN task_labels tl ON l.id = tl.label_id 
             WHERE tl.task_id = ?1"
        )?;

        let labels = stmt.query_map([task_id], |row| {
            Ok(Label {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                created_at: row.get(3)?,
            })
        })?.filter_map(|r| r.ok()).collect();

        Ok(labels)
    }

    pub fn update_task(&self, task: Task) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE tasks SET title = ?1, description = ?2, priority = ?3, due_date = ?4, reminder_date = ?5, completed = ?6, completed_at = ?7, position = ?8 WHERE id = ?9",
            params![task.title, task.description, task.priority, task.due_date, task.reminder_date, task.completed as i32, task.completed_at, task.position, task.id],
        )?;
        Ok(())
    }

    pub fn delete_task(&self, task_id: &str) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM task_labels WHERE task_id = ?1", [task_id])?;
        conn.execute("DELETE FROM tasks WHERE id = ?1", [task_id])?;
        Ok(())
    }

    pub fn update_task_positions(&self, positions: Vec<(String, i32)>) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        for (id, position) in positions {
            conn.execute("UPDATE tasks SET position = ?1 WHERE id = ?2", params![position, id])?;
        }
        Ok(())
    }

    // Label operations
    pub fn create_label(&self, name: String, color: String) -> SqliteResult<Label> {
        let conn = self.conn.lock().unwrap();
        let id = Uuid::new_v4().to_string();
        let created_at = Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO labels (id, name, color, created_at) VALUES (?1, ?2, ?3, ?4)",
            params![id, name, color, created_at],
        )?;

        Ok(Label {
            id,
            name,
            color,
            created_at,
        })
    }

    pub fn get_all_labels(&self) -> SqliteResult<Vec<Label>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, name, color, created_at FROM labels ORDER BY name")?;

        let labels = stmt.query_map([], |row| {
            Ok(Label {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                created_at: row.get(3)?,
            })
        })?.filter_map(|r| r.ok()).collect();

        Ok(labels)
    }

    pub fn update_label(&self, label: Label) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE labels SET name = ?1, color = ?2 WHERE id = ?3",
            params![label.name, label.color, label.id],
        )?;
        Ok(())
    }

    pub fn delete_label(&self, label_id: &str) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM task_labels WHERE label_id = ?1", [label_id])?;
        conn.execute("DELETE FROM labels WHERE id = ?1", [label_id])?;
        Ok(())
    }

    // Task-Label association
    pub fn add_label_to_task(&self, task_id: &str, label_id: &str) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT OR IGNORE INTO task_labels (task_id, label_id) VALUES (?1, ?2)",
            params![task_id, label_id],
        )?;
        Ok(())
    }

    pub fn remove_label_from_task(&self, task_id: &str, label_id: &str) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "DELETE FROM task_labels WHERE task_id = ?1 AND label_id = ?2",
            params![task_id, label_id],
        )?;
        Ok(())
    }

    pub fn get_tasks_by_label(&self, label_id: &str) -> SqliteResult<Vec<TaskWithLabels>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT t.id, t.title, t.description, t.priority, t.created_at, t.due_date, t.reminder_date, t.completed, t.completed_at, t.position 
             FROM tasks t
             INNER JOIN task_labels tl ON t.id = tl.task_id
             WHERE tl.label_id = ?1
             ORDER BY t.position"
        )?;

        let tasks: Vec<Task> = stmt.query_map([label_id], |row| {
            Ok(Task {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                priority: row.get(3)?,
                created_at: row.get(4)?,
                due_date: row.get(5)?,
                reminder_date: row.get(6)?,
                completed: row.get::<_, i32>(7)? != 0,
                completed_at: row.get(8)?,
                position: row.get(9)?,
            })
        })?.filter_map(|r| r.ok()).collect();

        drop(stmt);

        let mut result = Vec::new();
        for task in tasks {
            let labels = self.get_labels_for_task_internal(&conn, &task.id)?;
            result.push(TaskWithLabels { task, labels });
        }

        Ok(result)
    }

    // Settings operations
    pub fn get_setting(&self, key: &str) -> SqliteResult<Option<String>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT value FROM settings WHERE key = ?1")?;
        let result = stmt.query_row([key], |row| row.get(0));
        match result {
            Ok(value) => Ok(Some(value)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn set_setting(&self, key: &str, value: &str) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)",
            params![key, value],
        )?;
        Ok(())
    }

    pub fn get_all_settings(&self) -> SqliteResult<Vec<(String, String)>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT key, value FROM settings")?;
        let settings = stmt.query_map([], |row| {
            Ok((row.get(0)?, row.get(1)?))
        })?.filter_map(|r| r.ok()).collect();
        Ok(settings)
    }

    pub fn create_backup(&self, backup_path: &str, db_path: &str) -> Result<String, String> {
        let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S");
        let backup_file = format!("{}/taskflow_backup_{}.db", backup_path, timestamp);
        
        // Create backup directory if needed
        std::fs::create_dir_all(backup_path).map_err(|e| e.to_string())?;
        
        // Copy database file
        std::fs::copy(db_path, &backup_file).map_err(|e| e.to_string())?;
        
        // Update last backup time
        self.set_setting("last_backup", &chrono::Utc::now().to_rfc3339())
            .map_err(|e| e.to_string())?;
        
        Ok(backup_file)
    }

    pub fn get_notification_tasks(&self) -> SqliteResult<(Vec<TaskWithLabels>, Vec<TaskWithLabels>)> {
        let conn = self.conn.lock().unwrap();
        let now = chrono::Utc::now().to_rfc3339();
        
        // Overdue tasks
        let mut stmt = conn.prepare(
            "SELECT id, title, description, priority, created_at, due_date, reminder_date, completed, completed_at, position
            FROM tasks 
            WHERE completed = 0 AND due_date IS NOT NULL AND due_date < ?1
            ORDER BY due_date ASC"
        )?;
        
        let overdue: Vec<Task> = stmt.query_map([&now], |row| {
            Ok(Task {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                priority: row.get(3)?,
                created_at: row.get(4)?,
                due_date: row.get(5)?,
                reminder_date: row.get(6)?,
                completed: row.get::<_, i32>(7)? != 0,
                completed_at: row.get(8)?,
                position: row.get(9)?,
            })
        })?.filter_map(|r| r.ok()).collect();
        
        drop(stmt);
        
        // Reminder tasks (not already in overdue)
        let mut stmt = conn.prepare(
            "SELECT id, title, description, priority, created_at, due_date, reminder_date, completed, completed_at, position
            FROM tasks 
            WHERE completed = 0 AND reminder_date IS NOT NULL AND reminder_date <= ?1
            AND (due_date IS NULL OR due_date >= ?1)
            ORDER BY reminder_date ASC"
        )?;
        
        let reminders: Vec<Task> = stmt.query_map([&now], |row| {
            Ok(Task {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                priority: row.get(3)?,
                created_at: row.get(4)?,
                due_date: row.get(5)?,
                reminder_date: row.get(6)?,
                completed: row.get::<_, i32>(7)? != 0,
                completed_at: row.get(8)?,
                position: row.get(9)?,
            })
        })?.filter_map(|r| r.ok()).collect();
        
        drop(stmt);
        
        // Get labels for each task
        let mut overdue_with_labels = Vec::new();
        for task in overdue {
            let labels = self.get_labels_for_task_internal(&conn, &task.id)?;
            overdue_with_labels.push(TaskWithLabels { task, labels });
        }
        
        let mut reminders_with_labels = Vec::new();
        for task in reminders {
            let labels = self.get_labels_for_task_internal(&conn, &task.id)?;
            reminders_with_labels.push(TaskWithLabels { task, labels });
        }
        
        Ok((overdue_with_labels, reminders_with_labels))
    }

    pub fn should_backup(&self) -> bool {
        let enabled = self.get_setting("backup_enabled")
            .ok()
            .flatten()
            .map(|v| v == "true")
            .unwrap_or(false);
        
        if !enabled {
            return false;
        }
        
        let interval_days: i64 = self.get_setting("backup_interval_days")
            .ok()
            .flatten()
            .and_then(|v| v.parse().ok())
            .unwrap_or(7);
        
        let last_backup = self.get_setting("last_backup")
            .ok()
            .flatten()
            .and_then(|v| chrono::DateTime::parse_from_rfc3339(&v).ok());
        
        match last_backup {
            None => true,
            Some(last) => {
                let now = chrono::Utc::now();
                let diff = now.signed_duration_since(last.with_timezone(&chrono::Utc));
                diff.num_days() >= interval_days
            }
        }
    }

}
