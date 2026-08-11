export const trackerTypes = [
  "boolean",
  "number",
  "duration",
  "time_range",
  "rating",
  "counter",
  "currency",
  "streak",
] as const;
export type TrackerType = (typeof trackerTypes)[number];
export type Tracker = {
  id: string;
  user_id: string;
  name: string;
  tracker_type: TrackerType;
  unit: string | null;
  goal_value: number | null;
  color: string | null;
  is_active: boolean;
  sort_order: number;
};
export type TrackerEntry = {
  id: string;
  tracker_id: string;
  entry_date: string;
  numeric_value: number | null;
  boolean_value: boolean | null;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  rating_value: number | null;
  currency_value: number | null;
  currency_code: string | null;
};
