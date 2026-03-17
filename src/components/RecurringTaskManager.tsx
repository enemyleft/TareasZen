import { useState, useEffect } from "react";
import { RecurringTask } from "../types";
import { RecurringTaskForm } from "./RecurringTaskForm";
import * as api from "../api";

interface RecurringTaskManagerProps {
  onClose: () => void;
}

const intervalLabels: Record<string, string> = {
  days: "days",
  weeks: "weeks",
  months: "months",
  day_of_month: "of each month",
};

const priorityLabels = ["", "Low", "Medium", "High"];

export function RecurringTaskManager({ onClose }: RecurringTaskManagerProps) {
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<RecurringTask | null>(null);

  useEffect(() => {
    loadRecurringTasks();
  }, []);

  const loadRecurringTasks = async () => {
    try {
      const tasks = await api.getAllRecurringTasks();
      setRecurringTasks(tasks);
    } catch (error) {
      console.error("Failed to load recurring tasks:", error);
    }
  };

  const handleCreate = async (
    title: string,
    description: string | null,
    priority: number,
    intervalValue: number,
    intervalUnit: string,
    dueDateOffset: number | null,
    startDate: string,
    endDate: string | null
  ) => {
    try {
      await api.createRecurringTask(
        title,
        description,
        priority,
        intervalValue,
        intervalUnit,
        dueDateOffset,
        startDate,
        endDate
      );
      await loadRecurringTasks();
      setShowForm(false);
    } catch (error) {
      console.error("Failed to create recurring task:", error);
    }
  };

  const handleUpdate = async (
    title: string,
    description: string | null,
    priority: number,
    intervalValue: number,
    intervalUnit: string,
    dueDateOffset: number | null,
    startDate: string,
    endDate: string | null
  ) => {
    if (!editingTask) return;

    try {
      await api.updateRecurringTask({
        ...editingTask,
        title,
        description,
        priority,
        interval_value: intervalValue,
        interval_unit: intervalUnit,
        due_date_offset: dueDateOffset,
        start_date: startDate,
        end_date: endDate,
      });
      await loadRecurringTasks();
      setEditingTask(null);
    } catch (error) {
      console.error("Failed to update recurring task:", error);
    }
  };

  const handleToggleActive = async (task: RecurringTask) => {
    try {
      await api.updateRecurringTask({
        ...task,
        is_active: !task.is_active,
      });
      await loadRecurringTasks();
    } catch (error) {
      console.error("Failed to toggle recurring task:", error);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await api.confirmDialog("Delete this recurring task?");
    if (!confirmed) return;

    try {
      await api.deleteRecurringTask(id);
      await loadRecurringTasks();
    } catch (error) {
      console.error("Failed to delete recurring task:", error);
    }
  };

  const formatInterval = (task: RecurringTask) => {
    if (task.interval_unit === "day_of_month") {
      return `Day ${task.interval_value} of each month`;
    }
    return `Every ${task.interval_value} ${intervalLabels[task.interval_unit]}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Recurring Tasks</h2>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + New
          </button>
        </div>

        <div className="recurring-task-list">
          {recurringTasks.length === 0 ? (
            <p className="empty-state">No recurring tasks configured</p>
          ) : (
            recurringTasks.map((task) => (
              <div
                key={task.id}
                className={`recurring-task-item ${!task.is_active ? "inactive" : ""}`}
              >
                <div className="recurring-task-info">
                  <div className="recurring-task-header">
                    <span className="recurring-task-title">{task.title}</span>
                    <span className={`priority-badge priority-${task.priority}`}>
                      {priorityLabels[task.priority]}
                    </span>
                  </div>
                  <div className="recurring-task-details">
                    <span>{formatInterval(task)}</span>
                    {task.due_date_offset && (
                      <span>Due: +{task.due_date_offset} days</span>
                    )}
                    <span>Start: {formatDate(task.start_date)}</span>
                    {task.end_date && <span>End: {formatDate(task.end_date)}</span>}
                  </div>
                  {task.last_run && (
                    <div className="recurring-task-lastrun">
                      Last run: {formatDate(task.last_run)}
                    </div>
                  )}
                </div>
                <div className="recurring-task-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleToggleActive(task)}
                    title={task.is_active ? "Pause" : "Resume"}
                  >
                    {task.is_active ? "⏸️" : "▶️"}
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => setEditingTask(task)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleDelete(task.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="form-actions">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {showForm && (
        <RecurringTaskForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingTask && (
        <RecurringTaskForm
          recurringTask={editingTask}
          onSubmit={handleUpdate}
          onCancel={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}