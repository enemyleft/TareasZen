import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskWithLabels } from "../types";

interface TaskCardProps {
  taskWithLabels: TaskWithLabels;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  sortable?: boolean;
}

const priorityLabels = ["", "low", "medium", "high"];
const priorityColors = ["", "#4ade80", "#facc15", "#f87171"];

export function TaskCard({
  taskWithLabels,
  onEdit,
  onDelete,
  onToggleComplete,
  sortable = false,
}: TaskCardProps) {
  const { task, labels } = taskWithLabels;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !sortable });

  const style = sortable
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }
    : {};

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const isOverdue =
    task.due_date && !task.completed && new Date(task.due_date) < new Date();

  const isReminder =
    task.reminder_date && !task.completed && new Date(task.reminder_date) <= new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${task.completed ? "completed" : ""} ${
        isOverdue ? "overdue" : "" 
      } ${ isReminder && !isOverdue ? "remind" : ""} `} 
    >
      {sortable && (
        <div className="drag-handle" {...attributes} {...listeners}>
          ⠿
        </div>
      )}

      <div className="task-checkbox" onClick={onToggleComplete}>
        {task.completed ? "✓" : ""}
      </div>

      <div className="task-content">
        <div className="task-header">
          <h3 className="task-title">{task.title}</h3>
          <span
            className="priority-badge"
            style={{ backgroundColor: priorityColors[task.priority] }}
          >
            {priorityLabels[task.priority]}
          </span>
        </div>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        <div className="task-meta">
          {labels.length > 0 && (
            <div className="task-labels">
              {labels.map((label) => (
                <span
                  key={label.id}
                  className="task-label"
                  style={{ backgroundColor: label.color }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}

          <div className="task-dates">
            {task.due_date && (
              <span className={`due-date ${isOverdue ? "overdue" : ""}`}>
                📅 {formatDate(task.due_date)}
              </span>
            )}
            {task.reminder_date && (
              <span className={`reminder-date ${isReminder ? "active" : ""}`}>
                🔔 {formatDate(task.reminder_date)}
              </span>
            )}
            {task.completed_at && (
              <span className="completed-date">
                ✓ {formatDate(task.completed_at)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="task-actions">
        <button className="btn-icon" onClick={onEdit} title="edit">
          ✏️
        </button>
        <button className="btn-icon" onClick={onDelete} title="delete">
          🗑️
        </button>
      </div>
    </div>
  );
}
