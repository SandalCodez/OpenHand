import RoadMap, { type LessonNode } from "../../../components/roadmap/RoadMap";
import { classesData } from "../../../assets/classes/Classes";  

export default function RoadmapPage() {
  const lessons: LessonNode[] = classesData.map((c, i) => ({
    id: c.id,
    title: c.title,
    level: c.level as "beginner" | "intermediate" | "advanced",
    questions: c.questions,
    xp: Math.min(Math.floor(c.questions * 0.4), c.questions), // demo progress
    xpNeeded: c.questions,
    order: i,
  }));

  return (
    <div className="container py-3">
      <h2 className="display-6 text-light mb-3">Your Road</h2>
      <RoadMap lessons={lessons} currentIndex={3} />
    </div>
  );
}