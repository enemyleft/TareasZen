import { useState } from "react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Label, TaskWithLabels } from "../types";

interface TaskFormProps {
  labels: Label[];
  taskWithLabels?: TaskWithLabels;
  onSubmit: (
    title: string,
    description: string | null,
    priority: number,
    dueDate: string | null,
    reminderDate: string | null,
    labelIds: string[]
  ) => void;
  onCancel: () => void;
}

export function TaskForm({
  labels,
  taskWithLabels,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const { t } = useLingui();
  const isEditing = !!taskWithLabels;
  const task = taskWithLabels?.task;

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState(task?.priority || 1);
  const [dueDate, setDueDate] = useState(
    task?.due_date ? task.due_date.split("T")[0] : ""
  );
  const [reminderDate, setReminderDate] = useState(
    task?.reminder_date ? task.reminder_date.split("T")[0] : ""
  );
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>(
    taskWithLabels?.labels.map((l) => l.id) || []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit(
      title.trim(),
      description.trim() || null,
      priority,
      dueDate ? new Date(dueDate).toISOString() : null,
      reminderDate ? new Date(reminderDate).toISOString() : null,
      selectedLabelIds
    );
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isEditing ? t`Edit task` : t`New task`}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <Trans>
              <label htmlFor="title">Title *</label>
            </Trans>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t`Task name`}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <Trans>
              <label htmlFor="description">Description</label>
            </Trans>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t`Description`}
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <Trans>
                <label htmlFor="priority">Priority</label>
              </Trans>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
              >
                <option value={1}>{t`Low`}</option>
                <option value={2}>{t`Medium`}</option>
                <option value={3}>{t`High`}</option>
              </select>
            </div>

            <div className="form-group">
              <Trans>
                <label htmlFor="dueDate">Due date</label>
              </Trans>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <Trans>
                <label htmlFor="reminderDate">Reminder</label>
              </Trans>
              <input
                id="reminderDate"
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <Trans>
              <label>Labels</label>
            </Trans>
            <div className="label-selector">
              {labels.map((label) => (
                <button
                  key={label.id}
                  type="button"
                  className={`label-option ${
                    selectedLabelIds.includes(label.id) ? "selected" : ""
                  }`}
                  style={{
                    borderColor: label.color,
                    backgroundColor: selectedLabelIds.includes(label.id)
                      ? label.color
                      : "transparent",
                  }}
                  onClick={() => toggleLabel(label.id)}
                >
                  {label.name}
                </button>
              ))}
              {labels.length === 0 && (
                <Trans>
                  <span className="no-labels">No labels available</span>
                </Trans>
              )}
            </div>
          </div>

          <div className="form-actions">
            <Trans>
              <button type="button" className="btn-secondary" onClick={onCancel}>
                Cancel
              </button>
            </Trans>
            <button type="submit" className="btn-primary">
              {isEditing ? t`Save` : t`Create`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
