import { ClipboardClock, TriangleAlert, Bell } from "lucide-react";
import { Trans } from "@lingui/react/macro";
import { TaskWithLabels } from "../types";

interface StartupNotificationProps {
  overdueTasks: TaskWithLabels[];
  reminderTasks: TaskWithLabels[];
  onClose: () => void;
}

export function StartupNotification({
  overdueTasks,
  reminderTasks,
  onClose,
}: StartupNotificationProps) {
  if (overdueTasks.length === 0 && reminderTasks.length === 0) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal notification-modal" onClick={(e) => e.stopPropagation()}>
        <Trans>
          <h2 className="notification-section-header"><ClipboardClock size={16}/>&nbsp;Reminders</h2>
        </Trans>
        {overdueTasks.length > 0 && (
          <div className="notification-section">
            <Trans>
              <h3 className="notification-section-title overdue">
                <TriangleAlert size={16} />&nbsp;Due / Overdue ({overdueTasks.length})
              </h3>
            </Trans>
            <ul className="notification-list">
              {overdueTasks.map((t) => (
                <li key={t.task.id} className="notification-item overdue">
                  <div className="notification-content">
                    <span className="notification-title">{t.task.title}</span>
                    <div className="notification-labels">
                      {t.labels.map((label) => (
                        <span key={label.id} className="notification-label">
                          <span
                            className="label-dot"
                            style={{ backgroundColor: label.color }}
                          />
                          {label.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Trans>
                    <span className="notification-date">
                      Due: {new Date(t.task.due_date!).toLocaleDateString()}
                    </span>
                  </Trans>
                </li>
              ))}
            </ul>
          </div>
        )}

        {reminderTasks.length > 0 && (
          <div className="notification-section">
            <Trans>
              <h3 className="notification-section-title reminder">
                <Bell size={16} />&nbsp;Reminders ({reminderTasks.length})
              </h3>
            </Trans>
            <ul className="notification-list">
              {reminderTasks.map((t) => (
                <li key={t.task.id} className="notification-item reminder">
                  <div className="notification-content">
                    <span className="notification-title">{t.task.title}</span>
                    <div className="notification-labels">
                      {t.labels.map((label) => (
                        <span key={label.id} className="notification-label">
                          <span
                            className="label-dot"
                            style={{ backgroundColor: label.color }}
                          />
                          {label.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="notification-date">
                    {new Date(t.task.reminder_date!).toLocaleDateString("de-CH")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="form-actions">
          <Trans>
            <button className="btn-primary" onClick={onClose}>
              Understood
            </button>
          </Trans>
        </div>
      </div>
    </div>
  );
}