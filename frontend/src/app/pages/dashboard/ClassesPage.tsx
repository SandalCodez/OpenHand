import React, { useEffect, useState } from "react";
import ClassCard from "../../../components/cards/ClassCard";

const ClassesPage: React.FC = () => {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/lessons');
      const data = await response.json();
      setLessons(data.lessons);
    } catch (err) {
      console.error('Error fetching lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mt-4 text-light">Loading lessons...</div>;
  }

  return (
    <div className="container mt-4 text-light">
      <h2 className="display-3 mb-4">Classes</h2>

      <div className="row g-3 g-md-4">
        {classesData.map((cls) => (
          <div key={cls.id} className="col-12 col-sm-6 col-lg-4">
            <ClassCard {...cls} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassesPage;