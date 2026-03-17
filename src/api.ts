import { invoke } from "@tauri-apps/api/tauri";
import { confirm } from "@tauri-apps/api/dialog";
import { Task, Label, TaskWithLabels, TaskFilter, RecurringTask } from "./types";

// Task API
export async function createTask(
  title: string,
  description: string | null,
  priority: number,
  dueDate: string | null,
  reminderDate: string | null
): Promise<Task> {
  return await invoke("create_task", {
    title,
    description,
    priority,
    dueDate,
    reminderDate,
  });
}

export async function getPlatform(): Promise<String> {
  return await invoke("get_platform");
}

export async function getTasks(filter: TaskFilter): Promise<TaskWithLabels[]> {
  return await invoke("get_tasks", { filter });
}

export async function updateTask(task: Task): Promise<void> {
  return await invoke("update_task", { task });
}

export async function deleteTask(taskId: string): Promise<void> {
  return await invoke("delete_task", { taskId });
}

// Label API
export async function createLabel(name: string, color: string): Promise<Label> {
  return await invoke("create_label", { name, color });
}

export async function getAllLabels(): Promise<Label[]> {
  return await invoke("get_all_labels");
}

export async function updateLabel(label: Label): Promise<void> {
  return await invoke("update_label", { label });
}

export async function deleteLabel(labelId: string): Promise<void> {
  return await invoke("delete_label", { labelId });
}

// Task-Label association API
export async function addLabelToTask(taskId: string, labelId: string): Promise<void> {
  return await invoke("add_label_to_task", { taskId, labelId });
}

export async function removeLabelFromTask(taskId: string, labelId: string): Promise<void> {
  return await invoke("remove_label_from_task", { taskId, labelId });
}

// Settings API
export async function getAllSettings(): Promise<[string, string][]> {
  return await invoke("get_all_settings");
}

export async function setSetting(key: string, value: string): Promise<void> {
  return await invoke("set_setting", { key, value });
}

export async function createBackup(backupPath: string, dbPath: string): Promise<string> {
  return await invoke("create_backup", { backupPath, dbPath });
}

export async function getDefaultBackupPath(): Promise<string> {
  return await invoke("get_default_backup_path");
}

export async function getDbPath(): Promise<string> {
  return await invoke("get_db_path");
}

export async function checkAndRunBackup(): Promise<string | null> {
  return await invoke("check_and_run_backup");
}

export async function getNotificationTasks(): Promise<[TaskWithLabels[], TaskWithLabels[]]> {
  return await invoke("get_notification_tasks");
}

export async function confirmDialog(message: string): Promise<boolean> {
  return await confirm(message, { title: "TareasZen", type: "warning" });
}

// Recurring Tasks API
export async function createRecurringTask(
  title: string,
  description: string | null,
  priority: number,
  intervalValue: number,
  intervalUnit: string,
  dueDateOffset: number | null,
  startDate: string,
  endDate: string | null
): Promise<RecurringTask> {
  return await invoke("create_recurring_task", {
    title,
    description,
    priority,
    intervalValue,
    intervalUnit,
    dueDateOffset,
    startDate,
    endDate,
  });
}

export async function getAllRecurringTasks(): Promise<RecurringTask[]> {
  return await invoke("get_all_recurring_tasks");
}

export async function updateRecurringTask(task: RecurringTask): Promise<void> {
  return await invoke("update_recurring_task", { task });
}

export async function deleteRecurringTask(id: string): Promise<void> {
  return await invoke("delete_recurring_task", { id });
}

export async function processRecurringTasks(): Promise<string[]> {
  return await invoke("process_recurring_tasks");
}