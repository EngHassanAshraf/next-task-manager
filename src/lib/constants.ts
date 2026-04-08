export const TASK_STATUS = [
  "NEW",
  "IN_PROGRESS",
  "BLOCKED",
  "DONE",
  "CLOSED",
] as const;
export type TaskStatus = (typeof TASK_STATUS)[number];

export const MALFUNCTION_STATUS = [
  "OPENED_ON_TASK",
  "DONE_ON_TASK",
  "INACTIVE",
  "CLOSED",
] as const;
export type MalfunctionStatus = (typeof MALFUNCTION_STATUS)[number];

export const ACHIEVEMENT_TYPE = ["COMPUTED", "CUSTOM"] as const;
export type AchievementType = (typeof ACHIEVEMENT_TYPE)[number];

export const ACHIEVEMENT_STATUS = [
  "IN_PROGRESS",
  "ACHIEVED",
  "ARCHIVED",
] as const;
export type AchievementStatus = (typeof ACHIEVEMENT_STATUS)[number];

