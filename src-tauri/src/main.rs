#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod database;

use database::{Database, Label, Task, TaskWithLabels, TaskFilter, RecurringTask};
use std::sync::Mutex;
use tauri::State;

struct AppState {
    db: Database,
}

// Get OS Info 
#[tauri::command]
fn get_platform() -> Result<String, String> {
    Ok(std::env::consts::OS.to_string())
}

// Task commands
#[tauri::command]
fn create_task(
    state: State<Mutex<AppState>>,
    title: String,
    description: Option<String>,
    priority: i32,
    due_date: Option<String>,
    reminder_date: Option<String>,
) -> Result<Task, String> {
    let state = state.lock().map_err(|e| e.to_string())?;
    state.db.create_task(title, description, priority, due_date, reminder_date)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_tasks(state: State<Mutex<AppState>>, filter: TaskFilter) -> Result<Vec<TaskWithLabels>, String> {
    let state = state.lock().map_err(|e| e.to_string())?;
    state.db.get_tasks(filter).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_task(state: State<Mutex<AppState>>, task: Task) -> Result<(), String> {
    let state = state.lock().map_err(|e| e.to_string())?;
    state.db.update_task(task).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_task(state: State<Mutex<AppState>>, task_id: String) -> Result<(), String> {
    let state = state.lock().map_err(|e| e.to_string())?;
    state.db.delete_task(&task_id).map_err(|e| e.to_string())
}

// Label commands
#[tauri::command]
fn create_label(state: State<Mutex<AppState>>, name: String, color: String) -> Result<Label, String> {
    let state = state.lock().map_err(|e| e.to_string())?;
    state.db.create_label(name, color).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_all_labels(state: State<Mutex<AppState>>) -> Result<Vec<Label>, String> {
    let state = state.lock().map_err(|e| e.to_string())?;
    state.db.get_all_labels().map_err(|e| e.to_string())
}

#[tauri::command]
fn get_tasks_by_label(state: State<Mutex<AppState>>, label_id: String) -> Result<Vec<TaskWithLabels>, String> {
    let state = state.lock().map_err(|e| e.to_string())?;
    state.db.get_tasks_by_label(&label_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_label(state: State<Mutex<AppState>>, label: Label) -> Result<(), String> {
    let state = state.lock().map_err(|e| e.to_string())?;
    state.db.update_label(label).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_label_positions(state: State<Mutex<AppState>>, positions: Vec<(String, i32)>) -> Result<(), String> {
    let state = state.lock().map_err(|e| e.to_string())?;
    state.db.update_label_positions(positions).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_label(state: State<Mutex<AppState>>, label_id: String) -> Result<(), String> {
    let state = state.lock().map_err(|e| e.to_string())?;
    state.db.delete_label(&label_id).map_err(|e| e.to_string())
}

// Task-Label association commands
#[tauri::command]
fn add_label_to_task(state: State<Mutex<AppState>>, task_id: String, label_id: String) -> Result<(), String> {
    let state = state.lock().map_err(|e| e.to_string())?;
    state.db.add_label_to_task(&task_id, &label_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn remove_label_from_task(state: State<Mutex<AppState>>, task_id: String, label_id: String) -> Result<(), String> {
    let state = state.lock().map_err(|e| e.to_string())?;
    state.db.remove_label_from_task(&task_id, &label_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_all_settings(state: State<Mutex<AppState>>) -> Result<Vec<(String, String)>, String> {
    let state = state.lock().map_err(|e| e.to_string())?;
    state.db.get_all_settings().map_err(|e| e.to_string())
}

#[tauri::command]
fn set_setting(state: State<Mutex<AppState>>, key: String, value: String) -> Result<(), String> {
    let state = state.lock().map_err(|e| e.to_string())?;
    state.db.set_setting(&key, &value).map_err(|e| e.to_string())
}

#[tauri::command]
fn create_backup(state: State<Mutex<AppState>>, backup_path: String, db_path: String) -> Result<String, String> {
    let state = state.lock().map_err(|e| e.to_string())?;
    state.db.create_backup(&backup_path, &db_path)
}

#[tauri::command]
fn get_default_backup_path() -> Result<String, String> {
    dirs::document_dir()
        .map(|p| p.join("TareasZen Backups").to_string_lossy().to_string())
        .ok_or_else(|| "Could not determine documents directory".to_string())
}

#[tauri::command]
fn get_db_path() -> Result<String, String> {
    dirs::data_local_dir()
        .map(|p| p.join("tareaszen").join("tareaszen.db").to_string_lossy().to_string())
        .ok_or_else(|| "Could not determine data directory".to_string())
}

#[tauri::command]
fn check_and_run_backup(state: State<Mutex<AppState>>) -> Result<Option<String>, String> {
    let state = state.lock().map_err(|e| e.to_string())?;
    
    if !state.db.should_backup() {
        return Ok(None);
    }
    
    let backup_path = state.db.get_setting("backup_path")
        .map_err(|e| e.to_string())?
        .unwrap_or_default();
    
    if backup_path.is_empty() {
        return Ok(None);
    }
    
    let db_path = dirs::data_local_dir()
        .map(|p| p.join("tareaszen").join("tareaszen.db").to_string_lossy().to_string())
        .ok_or_else(|| "Could not determine data directory".to_string())?;
    
    let backup_file = state.db.create_backup(&backup_path, &db_path)?;
    Ok(Some(backup_file))
}

#[tauri::command]
fn get_notification_tasks(state: State<Mutex<AppState>>) -> Result<(Vec<TaskWithLabels>, Vec<TaskWithLabels>), String> {
    let state = state.lock().map_err(|e| e.to_string())?;
    state.db.get_notification_tasks().map_err(|e| e.to_string())
}

#[tauri::command]
fn create_recurring_task(
    state: State<Mutex<AppState>>,
    title: String,
    description: Option<String>,
    priority: i32,
    interval_value: i32,
    interval_unit: String,
    due_date_offset: Option<i32>,
    start_date: String,
    end_date: Option<String>,
) -> Result<RecurringTask, String> {
    let state = state.lock().map_err(|e| e.to_string())?;
    state.db.create_recurring_task(title, description, priority, interval_value, interval_unit, due_date_offset, start_date, end_date)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_all_recurring_tasks(state: State<Mutex<AppState>>) -> Result<Vec<RecurringTask>, String> {
    let state = state.lock().map_err(|e| e.to_string())?;
    state.db.get_all_recurring_tasks().map_err(|e| e.to_string())
}

#[tauri::command]
fn update_recurring_task(state: State<Mutex<AppState>>, task: RecurringTask) -> Result<(), String> {
    let state = state.lock().map_err(|e| e.to_string())?;
    state.db.update_recurring_task(task).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_recurring_task(state: State<Mutex<AppState>>, id: String) -> Result<(), String> {
    let state = state.lock().map_err(|e| e.to_string())?;
    state.db.delete_recurring_task(&id).map_err(|e| e.to_string())
}

#[tauri::command]
fn process_recurring_tasks(state: State<Mutex<AppState>>) -> Result<Vec<String>, String> {
    let state = state.lock().map_err(|e| e.to_string())?;
    state.db.process_recurring_tasks().map_err(|e| e.to_string())
}

fn main() {
    let db_path = dirs::data_local_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("tareaszen")
        .join("tareaszen.db");

    // Ensure directory exists
    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent).expect("Failed to create data directory");
    }

    let db = Database::new(db_path.to_str().unwrap()).expect("Failed to initialize database");

    tauri::Builder::default()
        .manage(Mutex::new(AppState { db }))
        .invoke_handler(tauri::generate_handler![
            get_platform,
            create_task,
            get_tasks,
            update_task,
            delete_task,
            create_label,
            get_all_labels,
            get_tasks_by_label,
            update_label,
            update_label_positions,
            delete_label,
            add_label_to_task,
            remove_label_from_task,
            get_all_settings,
            set_setting,
            create_backup,
            get_default_backup_path,
            get_db_path,
            check_and_run_backup,
            get_notification_tasks,
            create_recurring_task,
            get_all_recurring_tasks,
            update_recurring_task,
            delete_recurring_task,
            process_recurring_tasks,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
