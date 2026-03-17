import { useState } from "react";
import { RecurringTask } from "../types";

interface RecurringTaskFormProps {
  recurringTask?: RecurringTask;
  onSubmit: (
    title: string,
    description: string | null,
    priority: number,
    intervalValue: number,
    intervalUnit: string,
    dueDateOffset: number | null,
    startDate: string,
    endDate: string | null
  ) => void;
  onCancel: () => void;
}

export function RecurringTaskForm({
  recurringTask,
  onSubmit,
  onCancel,
}: RecurringTaskFormProps) {
  const isEditing = !!recurringTask;

  const [title, setTitle] = useState(recurringTask?.title || "");
  const [description, setDescription] = useState(recurringTask?.description || "");
  const [priority, setPriority] = useState(recurringTask?.priority || 1);
  const [intervalValue, setIntervalValue] = useState(recurringTask?.interval_value || 1);
  const [intervalUnit, setIntervalUnit] = useState(recurringTask?.interval_unit || "days");
  const [dueDateOffset, setDueDateOffset] = useState<string>(
    recurringTask?.due_date_offset?.toString() || ""
  );
  const [startDate, setStartDate] = useState(
    recurringTask?.start_date?.split("T")[0] || new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    recurringTask?.end_date?.split("T")[0] || ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit(
      title.trim(),
      description.trim() || null,
      priority,
      intervalValue,
      intervalUnit,
      dueDateOffset ? parseInt(dueDateOffset) : null,
      startDate,
      endDate || null
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <h2>{isEditing ? "Edit Recurring Task" : "New Recurring Task"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="rt-title">Title *</label>
            <input
              id="rt-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="rt-description">Description</label>
            <textarea
              id="rt-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={2}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="rt-priority">Priority</label>
              <select
                id="rt-priority"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
              >
                <option value={1}>Low</option>
                <option value={2}>Medium</option>
                <option value={3}>High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="rt-due-offset">Due after (days)</label>
              <input
                id="rt-due-offset"
                type="number"
                min="0"
                value={dueDateOffset}
                onChange={(e) => setDueDateOffset(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Repeat every</label>
            <div className="interval-row">
              {intervalUnit === "day_of_month" ? (
                <select
                  value={intervalValue}
                  onChange={(e) => setIntervalValue(Number(e.target.value))}
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  min="1"
                  value={intervalValue}
                  onChange={(e) => setIntervalValue(Number(e.target.value))}
                  className="interval-value"
                />
              )}
              <select
                value={intervalUnit}
                onChange={(e) => {
                  setIntervalUnit(e.target.value);
                  if (e.target.value === "day_of_month") {
                    setIntervalValue(1);
                  }
                }}
                className="interval-unit"
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="day_of_month">Day of month</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="rt-start">Start date *</label>
              <input
                id="rt-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="rt-end">End date</label>
              <input
                id="rt-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {isEditing ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}