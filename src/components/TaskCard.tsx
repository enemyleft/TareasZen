import { useLingui } from "@lingui/react/macro";
import { Trans as Translation } from "@lingui/react";
import { msg } from "@lingui/core/macro";

import classnames from "classnames";
import { Eye, Pencil, Trash, Check, Bell, Calendar, CalendarClock } from "lucide-react";
import { TaskWithLabels } from "../types";

interface TaskCardProps {
  taskWithLabels: TaskWithLabels;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
}

const priorityLabels = [msg`None`, msg`Low`, msg`Medium`, msg`High`];

export function TaskCard({
  taskWithLabels,
  onView,
  onEdit,
  onDelete,
  onToggleComplete,
}: TaskCardProps) {
  const { t } = useLingui();
  const { task, labels } = taskWithLabels;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "--.--.--";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
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
          {task.completed ? (
            <Check size={16} />
          ) : ""}
        </div>
        <h3 className="task-title">{task.title}</h3>
        {task.priority > 0 && (
          <span className={`priority-badge priority-${task.priority}`}>
            <Translation id={priorityLabels[task.priority]?.id} />
          </span>
        )}
        <div className="task-actions">
          <button className="btn-icon" onClick={onView} title={t`View`}>
            <Eye size={16} />
          </button>
          <button className="btn-icon" onClick={onEdit} title={t`Edit`}>
            <Pencil size={16} />
          </button>
          <button className="btn-icon" onClick={onDelete} title={t`Delete`}>
            <Trash size={16} />
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
          <span className={classnames("task-date", {
            "overdue": isOverdue,
            "hasDueDate": !!task.due_date && !isOverdue,
          })}>
            {isOverdue ? (<CalendarClock size={16} />) : (<Calendar size={16} />)} {formatDate(task.due_date)}
          </span>
          <span className={classnames("task-date",{
            "active": isReminder,
            "hasReminder": !!task.reminder_date && !isReminder,
          })}>
            <Bell size={16} /> {formatDate(task.reminder_date)}
          </span>
          <span className="task-date completed-date">
            <Check size={16} /> {formatDate(task.completed_at)}
          </span>
        </div>
      </div>

    </div>
  );
}