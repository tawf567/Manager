export type Task = {
  id: string;
  user_id: string;
  objective_id: string | null;
  name: string;
  description: string | null;
  task_type: "fixed" | "flexible";
  frequency_type: string;
  frequency_config: Record<string, unknown>;
  scheduled_date: string | null;
  sort_order: number;
  is_active: boolean;
};
export type TaskCompletion = { task_id: string; date: string; completed: boolean };
