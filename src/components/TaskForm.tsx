import { useState } from "react";
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
  const isEditing = !!taskWithLabels;
  const task = taskWithLabels?.task;

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState(task?.priority || 2);
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
        <h2>{isEditing ? "Task bearbeiten" : "Neuer Task"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Titel *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="task name"
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="description"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
              >
                <option value={1}>low</option>
                <option value={2}>medium</option>
                <option value={3}>high</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">due date</label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reminderDate">reminder</label>
              <input
                id="reminderDate"
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Labels</label>
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
                <span className="no-labels">no lables available</span>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              cancel
            </button>
            <button type="submit" className="btn-primary">
              {isEditing ? "save" : "create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
