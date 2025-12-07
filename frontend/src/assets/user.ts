// user.ts – shared user types for the frontend

export type Level = "beginner" | "intermediate" | "advanced";

// 7 points: Fri → Thu
export type WeeklySeries = number[];

export type User = {
  id: string;
  userName: string;          // stored username
  email: string;

  // Display info
  nickname?: string;         // nice display name
  username?: string;         // handle like @username
  avatarSrc?: string;        // avatar URL
  title?: string;            // selected title (e.g. "Top Mentor")
  titleColor?: string;       // hex color or css value
  // bannerSrc?: string;     // (we can add this later when you’re ready)

  // Stats
  xp: number;
  dailyStreak: number;
  friendCount: number;

  // Dates
  joinDate?: string | null;  // ISO
  dob?: string | null;       // ISO

  // Weekly stats (7 values, Fri..Thu)
  weeklyThis: WeeklySeries;
  weeklyLast: WeeklySeries;

  level: Level;
  bio?: string;              // user biography
};

// Optional: if your charts use these
export const weekdayLabels = ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"];
