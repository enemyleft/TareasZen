import { useState, useEffect, useCallback } from "react";
import { Trans, useLingui } from "@lingui/react/macro";
import { TaskWithLabels, Label, SortBy, SortOrder, TaskFilter } from "./types";
import * as api from "./api";
import { TaskCard } from "./components/TaskCard";
import { TaskForm } from "./components/TaskForm";
import { LabelManager } from "./components/LabelManager";
import { Sidebar } from "./components/Sidebar";
import { FilterBar } from "./components/FilterBar";
import { StartupNotification } from "./components/StartupNotifications";
import { Settings } from "./components/Settings";
import { TaskView } from "./components/TaskView";
import { ZenDialog } from "./components/ZenDialog";
import { RecurringTaskManager } from "./components/RecurringTaskManager";

function App() {
  const { t } = useLingui();
  const [tasks, setTasks] = useState<TaskWithLabels[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("due_date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [filterPriority, setFilterPriority] = useState<number | null>(null);
  const [showCompleted, setShowCompleted] = useState<boolean | null>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithLabels | null>(null);
  const [showLabelManager, setShowLabelManager] = useState(false);
  const [showStartupNotification, setShowStartupNotification] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showRecurringTasks, setShowRecurringTasks] = useState(false);
  const [overdueTasks, setOverdueTasks] = useState<TaskWithLabels[]>([]);
  const [reminderTasks, setReminderTasks] = useState<TaskWithLabels[]>([]);
  const [lastNotificationDate, setLastNotificationDate] = useState<string>(new Date().toDateString());
  const [showZenDialog, setShowZenDialog] = useState(false);
  const [zenDialogType, setZenDialogType] = useState<"task" | "periodic">("task");
  const [zenModeEnabled, setZenModeEnabled] = useState(false);
  const [zenPeriodicEnabled, setZenPeriodicEnabled] = useState(true);
  const [zenIntervalMinutes, setZenIntervalMinutes] = useState(42);
  const [viewingTask, setViewingTask] = useState<TaskWithLabels | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      const filter: TaskFilter = {
        label_id: selectedLabelId,
        priority: filterPriority,
        completed: showCompleted,
        search: searchTerm.trim() || null,
        sort_by: sortBy,
        sort_order: sortOrder,
        limit: 1000,
      };
      const tasksData = await api.getTasks(filter);
      setTasks(tasksData);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  }, [selectedLabelId, filterPriority, showCompleted, searchTerm, sortBy, sortOrder]);

  const loadLabels = useCallback(async () => {
    try {
      const labelsData = await api.getAllLabels();
      setLabels(labelsData);
    } catch (error) {
      console.error("Failed to load labels:", error);
    }
  }, []);

  // Load labels once on mount
  useEffect(() => {
    loadLabels();
  }, [loadLabels]);

  // Load tasks when filters change
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Check backup and set OS class on initial load
  useEffect(() => {
    const init = async () => {
      try {
        const os = await api.getPlatform();
        document.documentElement.classList.add(`os-${os}`);
      } catch (e) {
        console.error("Failed to get platform:", e);
      }

      try {
        const backupResult = await api.checkAndRunBackup();
        if (backupResult) {
          console.log("Automatic backup created:", backupResult);
        }
      } catch (e) {
        console.error("Backup check failed:", e);
      }

    try {
      const createdTasks = await api.processRecurringTasks();
      if (createdTasks.length > 0) {
        console.log("Recurring tasks created:", createdTasks);
        loadTasks();
        loadLabels();
      }
    } catch (e) {
      console.error("Recurring tasks check failed:", e);
    }

    };
    init();
  }, []);

  // Process recurring tasks every 30 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const createdTasks = await api.processRecurringTasks();
        if (createdTasks.length > 0) {
          console.log("Recurring tasks created:", createdTasks);
          loadTasks();
          loadLabels();
        }
      } catch (e) {
        console.error("Recurring tasks check failed:", e);
      }
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Load notification tasks once on startup
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const [overdue, reminders] = await api.getNotificationTasks();
        setOverdueTasks(overdue);
        setReminderTasks(reminders);
      } catch (error) {
        console.error("Failed to load notification tasks:", error);
      }
    };
    loadNotifications();
  }, []);

  // Check for notifications periodically (for overnight running)
  useEffect(() => {
    const checkNotifications = async () => {
      const now = new Date();
      const today = now.toDateString();
      const hour = now.getHours();

      // New day and past 5 AM?
      if (today !== lastNotificationDate && hour >= 5) {
        try {
          const [overdue, reminders] = await api.getNotificationTasks();
          if (overdue.length > 0 || reminders.length > 0) {
            setOverdueTasks(overdue);
            setReminderTasks(reminders);
            setShowStartupNotification(true);
            setLastNotificationDate(today);
          }
        } catch (error) {
          console.error("Failed to check notifications:", error);
        }
      }
    };

    const interval = setInterval(checkNotifications, 30 * 60 * 1000); // 30 minutes
    return () => clearInterval(interval);
  }, [lastNotificationDate]);

  // Load zen mode settings
  useEffect(() => {
    const loadZenSettings = async () => {
      try {
        const settings = await api.getAllSettings();
        const settingsMap = Object.fromEntries(settings);
        setZenModeEnabled(settingsMap["zen_mode"] === "true");
        setZenPeriodicEnabled(settingsMap["zen_periodic"] !== "false");
        setZenIntervalMinutes(parseInt(settingsMap["zen_interval_minutes"]) || 42);
      } catch (error) {
        console.error("Failed to load zen settings:", error);
      }
    };
    loadZenSettings();
  }, [showSettings]);

  // Periodic zen reminder
  useEffect(() => {
    if (!zenPeriodicEnabled || showZenDialog) return;

    const timeout = setTimeout(() => {
      setZenDialogType("periodic");
      setShowZenDialog(true);
    }, zenIntervalMinutes * 60 * 1000);

    return () => clearTimeout(timeout);
  }, [zenPeriodicEnabled, zenIntervalMinutes, showZenDialog]);

  const handleCreateTask = async (
    title: string,
    description: string | null,
    priority: number,
    dueDate: string | null,
    reminderDate: string | null,
    labelIds: string[]
  ) => {
    try {
      const newTask = await api.createTask(
        title,
        description,
        priority,
        dueDate,
        reminderDate
      );
      for (const labelId of labelIds) {
        await api.addLabelToTask(newTask.id, labelId);
      }
      await loadTasks();
      setShowTaskForm(false);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleUpdateTask = async (
    taskWithLabels: TaskWithLabels,
    newLabelIds: string[]
  ) => {
    try {
      await api.updateTask(taskWithLabels.task);

      const currentLabelIds = taskWithLabels.labels.map((l) => l.id);
      const toAdd = newLabelIds.filter((id) => !currentLabelIds.includes(id));
      const toRemove = currentLabelIds.filter((id) => !newLabelIds.includes(id));

      for (const labelId of toAdd) {
        await api.addLabelToTask(taskWithLabels.task.id, labelId);
      }
      for (const labelId of toRemove) {
        await api.removeLabelFromTask(taskWithLabels.task.id, labelId);
      }

      await loadTasks();
      setEditingTask(null);
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const confirmed = await api.confirmDialog(t`Delete this task?`);
    if (!confirmed) {
      return;
    }
    try {
      await api.deleteTask(taskId);
      await loadTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleToggleComplete = async (taskWithLabels: TaskWithLabels) => {
    try {
      const isCompleting = !taskWithLabels.task.completed;
      const updatedTask = {
        ...taskWithLabels.task,
        completed: isCompleting,
        completed_at: isCompleting ? new Date().toISOString() : null,
      };
      await api.updateTask(updatedTask);
      await loadTasks();
      
      if (isCompleting && zenModeEnabled) {
        setZenDialogType("task");
        setShowZenDialog(true);
      }
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  // Tasks are already filtered and sorted by backend
  const filteredTasks = tasks;

  return (
    <div className="app">
      <Sidebar
        labels={labels}
        selectedLabelId={selectedLabelId}
        onSelectLabel={setSelectedLabelId}
        onManageLabels={() => setShowLabelManager(true)}
        onOpenSettings={() => setShowSettings(true)}
        onLabelsReorder={loadLabels}
      />

      <main className="main-content">
        
        <header className="header">
          <h1>
            {selectedLabelId
              ? labels.find((l) => l.id === selectedLabelId)?.name
              : "All Tasks"}
            <span className="task-count-header">{filteredTasks.length}</span>
          </h1>
          <div className="header-actions">
            <div className="search-box">
              <input
                type="text"
                placeholder={t`Search tasks...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-primary" onClick={() => setShowTaskForm(true)}>
              <Trans>+ New Task</Trans>
            </button>
          </div>
        </header>

        <FilterBar
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          filterPriority={filterPriority}
          setFilterPriority={setFilterPriority}
          showCompleted={showCompleted}
          setShowCompleted={setShowCompleted}
        />

        <div className="task-list">
          {filteredTasks.map((taskWithLabels) => (
            <TaskCard
              key={taskWithLabels.task.id}
              taskWithLabels={taskWithLabels}
              onView={() => setViewingTask(taskWithLabels)}
              onEdit={() => setEditingTask(taskWithLabels)}
              onDelete={() => handleDeleteTask(taskWithLabels.task.id)}
              onToggleComplete={() => handleToggleComplete(taskWithLabels)}
            />
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="empty-state">
            <Trans><p>no tasks found</p></Trans>
            <Trans>
              <button className="btn-secondary" onClick={() => setShowTaskForm(true)}>
                create first task
              </button>
            </Trans>
          </div>
        )}
      </main>

      {showTaskForm && (
        <TaskForm
          labels={labels}
          onSubmit={handleCreateTask}
          onCancel={() => setShowTaskForm(false)}
        />
      )}

      {editingTask && (
        <TaskForm
          labels={labels}
          taskWithLabels={editingTask}
          onSubmit={(title, desc, prio, due, reminder, labelIds) =>
            handleUpdateTask(
              { ...editingTask, task: { ...editingTask.task, title, description: desc, priority: prio, due_date: due, reminder_date: reminder } },
              labelIds
            )
          }
          onCancel={() => setEditingTask(null)}
        />
      )}
      {showStartupNotification && (
        <StartupNotification
          overdueTasks={overdueTasks}
          reminderTasks={reminderTasks}
          onClose={() => setShowStartupNotification(false)}
        />
      )}
      {showLabelManager && (
        <LabelManager
          labels={labels}
          onClose={() => setShowLabelManager(false)}
          onRefresh={() => { loadTasks(); loadLabels(); }}
        />
      )}
      {viewingTask && (
        <TaskView
          taskWithLabels={viewingTask}
          onClose={() => setViewingTask(null)}
          onEdit={() => {
            setEditingTask(viewingTask);
            setViewingTask(null);
          }}
        />
      )}
      {showSettings && (
        <Settings 
          onClose={() => setShowSettings(false)} 
          onOpenRecurringTasks={() => {
            setShowSettings(false);
            setShowRecurringTasks(true);
          }}
        />
      )}

      {showRecurringTasks && (
        <RecurringTaskManager onClose={() => setShowRecurringTasks(false)} />
      )}
      {showZenDialog && (
        <ZenDialog 
          onClose={() => setShowZenDialog(false)} 
          type={zenDialogType}
        />
      )}
    </div>
  );
}

export default App;

