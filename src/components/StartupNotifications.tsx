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
        <h2>📋 Reminders</h2>

        {overdueTasks.length > 0 && (
          <div className="notification-section">
            <h3 className="notification-section-title overdue">
              ⚠️ Due / Overdue ({overdueTasks.length})
            </h3>
            <ul className="notification-list">
              {overdueTasks.map((t) => (
                <li key={t.task.id} className="notification-item overdue">
                  <span className="notification-title">{t.task.title}</span>
                  <span className="notification-date">
                    {new Date(t.task.due_date!).toLocaleDateString("de-DE")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {reminderTasks.length > 0 && (
          <div className="notification-section">
            <h3 className="notification-section-title reminder">
              🔔 Reminders ({reminderTasks.length})
            </h3>
            <ul className="notification-list">
              {reminderTasks.map((t) => (
                <li key={t.task.id} className="notification-item reminder">
                  <span className="notification-title">{t.task.title}</span>
                  <span className="notification-date">
                    {new Date(t.task.reminder_date!).toLocaleDateString("de-DE")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="form-actions">
          <button className="btn-primary" onClick={onClose}>
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}