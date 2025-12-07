import { useEffect, useState } from "react";
import RoadMap, { type LessonNode } from "../../../components/roadmap/RoadMap";
import { classesData } from "../../../assets/classes/Classes";
import { UserManager } from "../../../services/UserManager";
import type { User } from "../../../assets/user";

export default function RoadmapPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const manager = UserManager.getInstance();
    // Subscribe to updates
    const unsub = manager.subscribe((u) => setUser(u));

    // Initial fetch if needed
    if (!manager.getCurrentUser()) {
      manager.fetchCurrentUser();
    } else {
      setUser(manager.getCurrentUser());
    }

    return unsub;
  }, []);

  const lessons: LessonNode[] = classesData.map((c, i) => ({
    id: c.id,
    title: c.title,
    level: c.level as "beginner" | "intermediate" | "advanced",
    questions: c.questions,
    xp: 0, // Individual lesson XP not tracked here for now, global XP used for unlocking
    xpNeeded: (i + 1) * 50,
    order: i,
  }));

  return (
    <div className="container py-3">
      <h2 className="display-6 text-light mb-3">Your Road</h2>
      <RoadMap lessons={lessons} currentIndex={0} userXP={user?.xp ?? 0} />
    </div>
  );
}
