import { Bell, Calendar, CalendarPlus } from "lucide-react";
import { TaskWithLabels } from "../types";

interface TaskViewProps {
  taskWithLabels: TaskWithLabels;
  onClose: () => void;
  onEdit: () => void;
}

const priorityLabels = ["", "Low", "Medium", "High"];

export function TaskView({ taskWithLabels, onClose, onEdit }: TaskViewProps) {
  const { task, labels } = taskWithLabels;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-wide task-view">
        <div className="task-view-header">
          <h2>{task.title}</h2>
          <span className={`priority-badge priority-${task.priority}`}>
            {priorityLabels[task.priority]}
          </span>
        </div>

        {task.completed && (
          <div className="task-view-status completed">
            ✓ Completed on {formatDateTime(task.completed_at)}
          </div>
        )}

        {labels.length > 0 && (
          <div className="task-view-section">
            <h3>Labels</h3>
            <div className="task-view-labels">
              {labels.map((label) => (
                <span key={label.id} className="task-view-label">
                  <span
                    className="label-dot"
                    style={{ backgroundColor: label.color }}
                  />
                  {label.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {task.description && (
          <div className="task-view-section">
            <h3>Description</h3>
            <p className="task-view-description">{task.description}</p>
          </div>
        )}

        <div className="task-view-section">
          <h3>Dates</h3>
          <div className="task-view-dates">
            <div className="task-view-date">
              <span className="task-view-date-label due"><Calendar size={16} /> Due</span>
              <span className="task-view-date-value">{formatDate(task.due_date)}</span>
            </div>
            <div className="task-view-date">
              <span className="task-view-date-label reminder"><Bell size={16} /> Reminder</span>
              <span className="task-view-date-value">{formatDate(task.reminder_date)}</span>
            </div>
            <div className="task-view-date">
              <span className="task-view-date-label created"><CalendarPlus size={16} /> Created</span>
              <span className="task-view-date-value">{formatDateTime(task.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn-primary" onClick={onEdit}>
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}