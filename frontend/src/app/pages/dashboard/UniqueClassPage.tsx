import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AslWebcamSender from "../../../components/AslWebcamSender";
import MainMascotAnimation from "../../../components/animations/MainMascotAnimation";
import "./UniqueClassPage.css";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface ClassData {
  lesson_id: string;
  title: string;
  image_url?: string;
  category: string;
  difficulty: string;
  passing_accuracy: number;
  gained_XP: number;
  instructions: string;
  order: number;
  is_active?: boolean;
}

interface LessonsResponse {
  lessons: ClassData[];
}

function getPrevNextLessonIds(
  currentId: string,
  lessons: ClassData[]
): { prevId: string | null; nextId: string | null } {
  const active = lessons.filter(l => l.is_active !== false);
  const sorted = [...active].sort((a, b) => a.order - b.order);

  const currentIndex = sorted.findIndex(l => l.lesson_id === currentId);
  if (currentIndex === -1) {
    return { prevId: null, nextId: null };
  }

  const prev = sorted[currentIndex - 1];
  const next = sorted[currentIndex + 1];

  return {
    prevId: prev ? prev.lesson_id : null,
    nextId: next ? next.lesson_id : null,
  };
}

export default function UniqueClassPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [prevLessonId, setPrevLessonId] = useState<string | null>(null);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch current lesson + all lessons in parallel
        const [lessonRes, allRes] = await Promise.all([
          fetch(`http://localhost:8000/api/lessons/${id}`),
          fetch("http://localhost:8000/api/lessons/all"),
        ]);

        if (!lessonRes.ok) {
          throw new Error(`Failed to fetch lesson (${lessonRes.status})`);
        }

        const lesson = (await lessonRes.json()) as ClassData;
        setClassData(lesson);

        if (allRes.ok) {
          const allData = (await allRes.json()) as LessonsResponse;
          const { prevId, nextId } = getPrevNextLessonIds(
            lesson.lesson_id,
            allData.lessons
          );
          setPrevLessonId(prevId);
          setNextLessonId(nextId);
        } else {
          setPrevLessonId(null);
          setNextLessonId(null);
        }
      } catch (err: any) {
        console.error("Error fetching class data:", err);
        setError(err.message ?? "Failed to load class");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleNextClass = () => {
    if (nextLessonId) {
      navigate(`/dashboard/UniqueClass/${nextLessonId}`);
    }
  };

  const handlePrevClass = () => {
    if (prevLessonId) {
      navigate(`/dashboard/UniqueClass/${prevLessonId}`);
    }
  };

  return (
    <div className="container-fluid unique-class-page">

      <div className="row">
        {/* LEFT SIDE */}
        
        <div className="col-12 col-lg-6  border border-1 border-light text-white py-2 unique-left">
            <div className="row">      
                {/* Mascot + popup */}
                <div className="col-lg-10">
                     {classData && !loading && !error && (
                        <div className="MascotAnimationPosition">
                        <div className="mascot-with-bubble">
                            <MainMascotAnimation size={200} />

                                <div className="mascot-bubble">
                            <div className="mascot-bubble-title">How to sign <span className="badge bg-dark text-white p-2 me-2">{classData.category}</span></div>
                            <p className="mascot-bubble-text">{classData.instructions}</p>
                            </div>
                        </div>
                     </div>
                 )}
                </div>
                <div className="col-lg-2 align-self-center">
                    <div className="mb-3">
                {classData && (
                    <>
                    
                    <span className="badge bg-success p-2 me-2 rounded-5 custom-badge">{classData.gained_XP} XP</span>
                    </>
                )
                
                }
                </div>
                </div>

             </div>
            {loading && <p>Loading...</p>}
            {error && !loading && <p className="text-danger">{error}</p>}

            {classData && !loading && !error && (
                <>
                {/* CENTERED MAIN CONTENT */}
            <div className="unique-left-main mt-4">
                {classData.image_url ? (
                <img
                    src={classData.image_url}
                    alt={classData.title}
                    style={{ width: 200, height: 200, objectFit: "contain" }}
                    className="mb-3 grow-shrink p-2  "
                />
                ) : (
                <div
                    className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
                    style={{ width: 120, height: 120, border: "1px dashed #4b5563" }}
                >
                    <span className="text-secondary small">no image</span>
                </div>
                )}

                <h1 className="display-5 p-2 mb-2">{classData.title}</h1>
            </div>

            {/* BUTTONS STUCK TO BOTTOM */}
            <div className="unique-left-buttons d-flex justify-content-between  px-4">
                <button
                className="btn btn-outline-light rounded-pill btn-sm"
                onClick={handlePrevClass}
                disabled={!prevLessonId}
                >
                <ChevronLeft size={14}/>Previous Class
                </button>
                <button
                className="btn btn-outline-light rounded-pill btn-sm"
                onClick={handleNextClass}
                disabled={!nextLessonId}
                >
                {nextLessonId ? (
                    <>
                    Next Class <ChevronRight size={14} />
                    </>
                ) : (
                    "No more classes"
                )}
                </button>
            </div>
            </>
        )}
    </div>

        {/* RIGHT SIDE */}
        <div className="col-12 col-lg-6 d-flex flex-column align-items-center justify-content-center border border-1 border-light vh-100 text-white py-5 unique-right">
          <AslWebcamSender wsUrl="ws://localhost:8000/ws" mode="letters" />
        </div>
      </div>
    </div>
  );
}
