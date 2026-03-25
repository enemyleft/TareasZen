import { Trans, useLingui } from "@lingui/react/macro";
import { Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { Label } from "../types";
import * as api from "../api";

interface LabelManagerProps {
  labels: Label[];
  onClose: () => void;
  onRefresh: () => void;
}

const defaultColors = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280", "#000000",
];

export function LabelManager({ labels, onClose, onRefresh }: LabelManagerProps) {
  const { t } = useLingui();
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(defaultColors[0]);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);

  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;

    try {
      await api.createLabel(newLabelName.trim(), newLabelColor);
      setNewLabelName("");
      setNewLabelColor(defaultColors[0]);
      onRefresh();
    } catch (error) {
      console.error("Failed to create label:", error);
    }
  };

  const handleUpdateLabel = async () => {
    if (!editingLabel) return;

    try {
      await api.updateLabel(editingLabel);
      setEditingLabel(null);
      onRefresh();
    } catch (error) {
      console.error("Failed to update label:", error);
    }
  };

  const handleDelete = async (label: Label) => {
    let message = t`Delete label "${label.name}"?`;
    
    try {
      const tasks = await api.getTasksByLabel(label.id);
      if (tasks.length > 0) {
        // Note for mantainers: This mesage is on ICU message format standard. Check for a quick reference https://crowdin.com/blog/icu-guide
        message = t`Delete label "${label.name}"?\n\nThis label is assigned to ${tasks.length} {tasks.length, plural, one {task} other {tasks}}. The tasks will not be deleted, only the label assignment.`;
      }
    } catch (error) {
      console.error("Failed to get tasks for label:", error);
    }

    const confirmed = await api.confirmDialog(message);
    if (!confirmed) return;

    try {
      await api.deleteLabel(label.id);
      onRefresh();
    } catch (error) {
      console.error("Failed to delete label:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <h2><Trans>Manage labels</Trans></h2>

        <form className="new-label-form" onSubmit={handleCreateLabel}>
          <input
            type="text"
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            placeholder={t`New label...`}
          />
          <div className="color-picker">
            {defaultColors.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-option ${
                  newLabelColor === color ? "selected" : ""
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setNewLabelColor(color)}
              />
            ))}
          </div>
          <button type="submit" className="btn-primary">
            <Trans>Add</Trans>
          </button>
        </form>

        <div className="label-list">
          {labels.map((label) => (
            <div key={label.id} className="label-item">
              {editingLabel?.id === label.id ? (
                <div className="label-edit-form">
                  <input
                    type="text"
                    value={editingLabel.name}
                    onChange={(e) =>
                      setEditingLabel({ ...editingLabel, name: e.target.value })
                    }
                  />
                  <div className="color-picker small">
                    {defaultColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`color-option ${
                          editingLabel.color === color ? "selected" : ""
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() =>
                          setEditingLabel({ ...editingLabel, color })
                        }
                      />
                    ))}
                  </div>
                  <div className="label-edit-actions">
                    <button className="btn-secondary" onClick={() => setEditingLabel(null)}>
                      <Trans>Cancel</Trans>
                    </button>
                    <button className="btn-primary" onClick={handleUpdateLabel}>
                      <Trans>Save</Trans>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span
                    className="label-preview"
                    style={{ backgroundColor: label.color }}
                  >
                    {label.name}
                  </span>
                  <div className="label-actions">
                    <button
                      className="btn-icon"
                      onClick={() => setEditingLabel(label)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleDelete(label)}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {labels.length === 0 && (
            <p className="empty-state"><Trans>No labels created yet</Trans></p>
          )}
        </div>

        <div className="form-actions">
          <button className="btn-secondary" onClick={onClose}>
            <Trans>Close</Trans>
          </button>
        </div>
      </div>
    </div>
  );
}
