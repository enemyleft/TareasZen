import { Bell, Calendar, CalendarPlus, Check } from "lucide-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Trans as Translation } from "@lingui/react";
import { msg } from "@lingui/core/macro";

import { TaskWithLabels } from "../types";

interface TaskViewProps {
  taskWithLabels: TaskWithLabels;
  onClose: () => void;
  onEdit: () => void;
}

const priorityLabels = [msg`None`, msg`Low`, msg`Medium`, msg`High`];

export function TaskView({ taskWithLabels, onClose, onEdit }: TaskViewProps) {
  const { t } = useLingui();
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
          {task.priority > 0 && (
            <span className={`priority-badge priority-${task.priority}`}>
              <Translation id={priorityLabels[task.priority]?.id} />
            </span>
          )}
        </div>

        {task.completed && (
          <Trans>
            <div className="task-view-status completed">
              <Check size={16} /> Completed on {formatDateTime(task.completed_at)}
            </div>
          </Trans>
        )}

        {labels.length > 0 && (
          <div className="task-view-section">
            <Trans>
              <h3>Labels</h3>
            </Trans>
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
            <Trans>
              <h3>Description</h3>
            </Trans>
            <p className="task-view-description">{task.description}</p>
          </div>
        )}

        <div className="task-view-section">
          <Trans>
            <h3>Dates</h3>
          </Trans>
          <div className="task-view-dates">
            <div className="task-view-date">
              <Trans>
                <span className="task-view-date-label due"><Calendar size={16} /> Due</span>
              </Trans>
              <span className="task-view-date-value">{formatDate(task.due_date)}</span>
            </div>
            <div className="task-view-date">
              <Trans>
                <span className="task-view-date-label reminder"><Bell size={16} /> Reminder</span>
              </Trans>
              <span className="task-view-date-value">{formatDate(task.reminder_date)}</span>
            </div>
            <div className="task-view-date">
              <Trans>
                <span className="task-view-date-label created"><CalendarPlus size={16} /> Created</span>
              </Trans>
              <span className="task-view-date-value">{formatDateTime(task.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <Trans>
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </Trans>
          <Trans>
            <button className="btn-primary" onClick={onEdit}>
              Edit
            </button>
          </Trans>
        </div>
      </div>
    </div>
  );
}