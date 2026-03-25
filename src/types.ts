export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: number;
  created_at: string;
  due_date: string | null;
  reminder_date: string | null;
  completed: boolean;
  completed_at: string | null;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  created_at: string;
  position: number;
}

export interface TaskWithLabels {
  task: Task;
  labels: Label[];
}

export type SortBy = 'priority' | 'created_at' | 'due_date' | 'completed_at';
export type SortOrder = 'asc' | 'desc';

export interface TaskFilter {
  label_id?: string | null;
  priority?: number | null;
  completed?: boolean | null;
  search?: string | null;
  sort_by?: string | null;
  sort_order?: string | null;
  limit?: number | null;
}

export interface RecurringTask {
  id: string;
  title: string;
  description: string | null;
  priority: number;
  interval_value: number;
  interval_unit: string; // "days", "weeks", "months", "day_of_month"
  due_date_offset: number | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  last_run: string | null;
  created_at: string;
}
