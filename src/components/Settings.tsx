import { useState, useEffect } from "react";
import { Trans, useLingui } from "@lingui/react/macro";
import * as api from "../api";

interface SettingsProps {
  onClose: () => void;
  onOpenRecurringTasks: () => void;
}

export function Settings({ onClose, onOpenRecurringTasks }: SettingsProps) {
  const { t } = useLingui();
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
      setBackupStatus(t`Settings saved`);
      setTimeout(() => setBackupStatus(null), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setBackupStatus(t`Error saving settings`);
    }
    setSaving(false);
  };

  const handleBackupNow = async () => {
    setBackupStatus(t`Creating backup...`);
    try {
      const pathToUse = backupPath.trim() || defaultPath;
      const backupFile = await api.createBackup(pathToUse, dbPath);
      setBackupStatus(t`Backup created: ${backupFile}`);
      setLastBackup(new Date().toISOString());
    } catch (error) {
      console.error("Backup failed:", error);
      setBackupStatus(t`Backup failed: ${error}`);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t`Never`;
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <h2><Trans>Settings</Trans></h2>

        <section className="settings-section">
          <h3><Trans>Recurring Tasks</Trans></h3>
          <Trans>
            <p className="settings-description">
              Configure tasks that are automatically created at regular intervals.
            </p>
          </Trans>
          <Trans>
            <button className="btn-secondary" onClick={onOpenRecurringTasks}>
              Manage Recurring Tasks
            </button>
          </Trans>
        </section>

        <section className="settings-section">
          <Trans>
            <h3>Zen Mode</h3>
          </Trans>
          <div className="form-group">
            <label className="settings-checkbox">
              <input
                type="checkbox"
                checked={zenMode}
                onChange={(e) => setZenMode(e.target.checked)}
              />
              <Trans>
                <span>&nbsp; Show mindfulness reminder after completing a task</span>
              </Trans>
            </label>
          </div>
          <div className="form-group">
            <label className="settings-checkbox">
              <input
                type="checkbox"
                checked={zenPeriodic}
                onChange={(e) => setZenPeriodic(e.target.checked)}
              />
              <Trans>
                <span>&nbsp; Show periodic mindfulness reminder</span>
              </Trans>
            </label>
          </div>
          {zenPeriodic && (
            <div className="form-group">
              <Trans>
                <label htmlFor="zenInterval">Reminder interval (minutes)</label>
              </Trans>
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
          <Trans>
            <h3>Automatic Backup</h3>
          </Trans>

          <div className="form-group">
            <Trans>
              <label className="settings-checkbox">
                <input
                  type="checkbox"
                  checked={backupEnabled}
                  onChange={(e) => setBackupEnabled(e.target.checked)}
                />
                &nbsp; Enable automatic backup
              </label>
            </Trans>
          </div>

          <div className="form-group">
            <Trans>
              <label htmlFor="backupPath">Backup folder</label>
            </Trans>
            <input
              id="backupPath"
              type="text"
              value={backupPath}
              onChange={(e) => setBackupPath(e.target.value)}
              placeholder={defaultPath}
            />
            <Trans>
              <span className="form-hint">Leave empty for default: {defaultPath}</span>
            </Trans>
          </div>

          <div className="form-group">
            <Trans>
              <label htmlFor="backupInterval">Backup interval</label>
            </Trans>
            <select
              id="backupInterval"
              value={backupInterval}
              onChange={(e) => setBackupInterval(e.target.value)}
            >
              <option value="1">{t`Daily`}</option>
              <option value="7">{t`Weekly`}</option>
              <option value="14">{t`Every 2 weeks`}</option>
              <option value="30">{t`Monthly`}</option>
            </select>
          </div>

          <div className="settings-info">
            <Trans>
              <p>Last backup: {formatDate(lastBackup)}</p>
            </Trans>
            <Trans>
              <p>Database location: {dbPath}</p>
            </Trans>
          </div>

          <div className="settings-actions">
            <Trans>
              <button className="btn-secondary" onClick={handleBackupNow}>
                Backup Now
              </button>
            </Trans>
          </div>

          {backupStatus && (
            <div className="settings-status">{backupStatus}</div>
          )}
        </section>

        <div className="form-actions">
          <Trans>
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </Trans>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? t`Saving...` : t`Save`}
          </button>
        </div>
      </div>
    </div>
  );
}