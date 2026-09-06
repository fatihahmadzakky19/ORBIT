import {
  GoalType,
  GoalStatus,
  ProgressMode,
  TransactionType,
  HabitSource,
} from "@prisma/client";

export type { GoalType, GoalStatus, ProgressMode, TransactionType, HabitSource };

export interface QuickActivityInput {
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  goalId?: string;
  habitId?: string;
  learningTopic?: string;
  note?: string;
}

export interface QuickLearningInput {
  topic: string;
  takeaways?: string;
  date: string; // YYYY-MM-DD
  time?: string;
  source?: string;
  activityId?: string;
  goalId?: string;
}

export interface QuickTransactionInput {
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note?: string;
  goalId?: string;
}

export interface GoalCardData {
  id: string;
  title: string;
  type: GoalType;
  status: GoalStatus;
  progressMode?: ProgressMode | null;
  currentValue?: number | null;
  targetValue?: number | null;
  unit?: string | null;
  deadline?: Date | string | null;
  percent: number;
  milestonesCount?: {
    total: number;
    completed: number;
  };
}

export interface HabitItemData {
  id: string;
  title: string;
  isCompletedToday: boolean;
  thisWeekCompletedDays: number;
  frequency: string;
}

export interface ReflectionContextData {
  weekStart: string;
  activitiesCount: number;
  learningCount: number;
  habitsConsistency: string; // e.g. "5 / 7"
  activeGoalsCount: number;
  incomeTotal: number;
  expenseTotal: number;
  activities: { id: string; title: string; durationMinutes: number }[];
  learnings: { id: string; topic: string; takeaways: string | null }[];
}
