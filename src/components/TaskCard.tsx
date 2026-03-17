import { TaskWithLabels } from "../types";

interface TaskCardProps {
  taskWithLabels: TaskWithLabels;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
}

const priorityLabels = ["", "Low", "Medium", "High"];

export function TaskCard({
  taskWithLabels,
  onView,
  onEdit,
  onDelete,
  onToggleComplete,
}: TaskCardProps) {
  const { task, labels } = taskWithLabels;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "--.--.--";
    const date = new Date(dateString);
    return date.toLocaleDateString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  const isOverdue =
    task.due_date && !task.completed && new Date(task.due_date) < new Date();

  const isReminder =
    task.reminder_date && !task.completed && new Date(task.reminder_date) <= new Date();

  const firstLineDescription = task.description
    ? task.description.split("\n")[0]
    : "";

  return (
    <div
      className={`task-card ${task.completed ? "completed" : ""} ${
        isOverdue ? "overdue" : ""
      }`}
    >
      {/* Row 1: Checkbox, Title, Priority, Actions */}
      <div className="task-row task-row-main">
        <div className="task-checkbox" onClick={onToggleComplete}>
          {task.completed ? "✓" : ""}
        </div>
        <h3 className="task-title">{task.title}</h3>
        <span className={`priority-badge priority-${task.priority}`}>
          {priorityLabels[task.priority]}
        </span>
        <div className="task-actions">
          <button className="btn-icon" onClick={onView} title="View">
            👁
          </button>
          <button className="btn-icon" onClick={onEdit} title="Edit">
            ✏️
          </button>
          <button className="btn-icon" onClick={onDelete} title="Delete">
            🗑️
          </button>
        </div>
      </div>

      {/* Row 2: Description */}
      <div className="task-row task-row-middle">
        <p className="task-description">{firstLineDescription}</p>
      </div>

      {/* Row 3: Labels + Dates */}
      <div className="task-row task-row-bottom">
        <div className="task-labels">
          {labels.map((label) => (
            <span key={label.id} className="task-label-compact">
              <span
                className="label-dot"
                style={{ backgroundColor: label.color }}
              />
              {label.name}
            </span>
          ))}
        </div>
        <div className="task-dates">
          <span className={`task-date ${isOverdue ? "overdue" : ""}`}>
            📅 {formatDate(task.due_date)}
          </span>
          <span className={`task-date ${isReminder ? "active" : ""}`}>
            🔔 {formatDate(task.reminder_date)}
          </span>
          <span className="task-date completed-date">
            ✓ {formatDate(task.completed_at)}
          </span>
        </div>
      </div>

    </div>
  );
}