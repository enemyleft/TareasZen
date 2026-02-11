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

  const handleDeleteLabel = async (labelId: string) => {
    if (!confirm("Label wirklich löschen? Tasks behalten ihre anderen Labels.")) {
      return;
    }

    try {
      await api.deleteLabel(labelId);
      onRefresh();
    } catch (error) {
      console.error("Failed to delete label:", error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <h2>Labels verwalten</h2>

        <form className="new-label-form" onSubmit={handleCreateLabel}>
          <input
            type="text"
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            placeholder="Neues Label..."
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
            Hinzufügen
          </button>
        </form>

        <div className="label-list">
          {labels.map((label) => (
            <div key={label.id} className="label-item">
              {editingLabel?.id === label.id ? (
                <>
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
                  <button className="btn-primary" onClick={handleUpdateLabel}>
                    Speichern
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setEditingLabel(null)}
                  >
                    Abbrechen
                  </button>
                </>
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
                      ✏️
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleDeleteLabel(label.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {labels.length === 0 && (
            <p className="empty-state">Noch keine Labels erstellt</p>
          )}
        </div>

        <div className="form-actions">
          <button className="btn-secondary" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
