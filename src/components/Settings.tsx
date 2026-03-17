import { useState, useEffect } from "react";
import * as api from "../api";

interface SettingsProps {
  onClose: () => void;
  onOpenRecurringTasks: () => void;
}

export function Settings({ onClose, onOpenRecurringTasks }: SettingsProps) {
  const [backupEnabled, setBackupEnabled] = useState(false);
  const [backupPath, setBackupPath] = useState("");
  const [backupInterval, setBackupInterval] = useState("7");
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [defaultPath, setDefaultPath] = useState("");
  const [dbPath, setDbPath] = useState("");
  const [saving, setSaving] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [zenMode, setZenMode] = useState(false);
  const [zenPeriodic, setZenPeriodic] = useState(true);
  const [zenInterval, setZenInterval] = useState("42");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [settings, defPath, database] = await Promise.all([
        api.getAllSettings(),
        api.getDefaultBackupPath(),
        api.getDbPath(),
      ]);

      setDefaultPath(defPath);
      setDbPath(database);

      const settingsMap = Object.fromEntries(settings);
      setBackupEnabled(settingsMap["backup_enabled"] === "true");
      setBackupPath(settingsMap["backup_path"] || "");
      setBackupInterval(settingsMap["backup_interval_days"] || "7");
      setLastBackup(settingsMap["last_backup"] || null);
      setZenMode(settingsMap["zen_mode"] === "true");
      setZenPeriodic(settingsMap["zen_periodic"] !== "false");
      setZenInterval(settingsMap["zen_interval_minutes"] || "42");
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const pathToSave = backupPath.trim() || defaultPath;
      await api.setSetting("backup_enabled", backupEnabled.toString());
      await api.setSetting("backup_path", pathToSave);
      await api.setSetting("backup_interval_days", backupInterval);
      await api.setSetting("zen_mode", zenMode.toString());
      await api.setSetting("zen_periodic", zenPeriodic.toString());
      await api.setSetting("zen_interval_minutes", zenInterval);
      setBackupPath(pathToSave);
      setBackupStatus("Settings saved");
      setTimeout(() => setBackupStatus(null), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setBackupStatus("Error saving settings");
    }
    setSaving(false);
  };

  const handleBackupNow = async () => {
    setBackupStatus("Creating backup...");
    try {
      const pathToUse = backupPath.trim() || defaultPath;
      const backupFile = await api.createBackup(pathToUse, dbPath);
      setBackupStatus(`Backup created: ${backupFile}`);
      setLastBackup(new Date().toISOString());
    } catch (error) {
      console.error("Backup failed:", error);
      setBackupStatus(`Backup failed: ${error}`);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <h2>Settings</h2>

        <section className="settings-section">
          <h3>Recurring Tasks</h3>
          <p className="settings-description">
            Configure tasks that are automatically created at regular intervals.
          </p>
          <button className="btn-secondary" onClick={onOpenRecurringTasks}>
            Manage Recurring Tasks
          </button>
        </section>

        <section className="settings-section">
          <h3>Zen Mode</h3>
          <div className="form-group">
            <label className="settings-checkbox">
              <input
                type="checkbox"
                checked={zenMode}
                onChange={(e) => setZenMode(e.target.checked)}
              />
              <span>&nbsp; Show mindfulness reminder after completing a task</span>
            </label>
          </div>
          <div className="form-group">
            <label className="settings-checkbox">
              <input
                type="checkbox"
                checked={zenPeriodic}
                onChange={(e) => setZenPeriodic(e.target.checked)}
              />
              <span>&nbsp; Show periodic mindfulness reminder</span>
            </label>
          </div>
          {zenPeriodic && (
            <div className="form-group">
              <label htmlFor="zenInterval">Reminder interval (minutes)</label>
              <input
                id="zenInterval"
                type="number"
                min="1"
                value={zenInterval}
                onChange={(e) => setZenInterval(e.target.value)}
              />
            </div>
          )}
        </section>

        <section className="settings-section">
          <h3>Automatic Backup</h3>

          <div className="form-group">
            <label className="settings-checkbox">
              <input
                type="checkbox"
                checked={backupEnabled}
                onChange={(e) => setBackupEnabled(e.target.checked)}
              />
              &nbsp; Enable automatic backup
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="backupPath">Backup folder</label>
            <input
              id="backupPath"
              type="text"
              value={backupPath}
              onChange={(e) => setBackupPath(e.target.value)}
              placeholder={defaultPath}
            />
            <span className="form-hint">Leave empty for default: {defaultPath}</span>
          </div>

          <div className="form-group">
            <label htmlFor="backupInterval">Backup interval</label>
            <select
              id="backupInterval"
              value={backupInterval}
              onChange={(e) => setBackupInterval(e.target.value)}
            >
              <option value="1">Daily</option>
              <option value="7">Weekly</option>
              <option value="14">Every 2 weeks</option>
              <option value="30">Monthly</option>
            </select>
          </div>

          <div className="settings-info">
            <p>Last backup: {formatDate(lastBackup)}</p>
            <p>Database location: {dbPath}</p>
          </div>

          <div className="settings-actions">
            <button className="btn-secondary" onClick={handleBackupNow}>
              Backup Now
            </button>
          </div>

          {backupStatus && (
            <div className="settings-status">{backupStatus}</div>
          )}
        </section>

        <div className="form-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}