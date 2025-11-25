import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ClassCard from "../../../components/cards/ClassCard";
import MoonLoader from "react-spinners/MoonLoader";
import MainMascotAnimation from "../../../components/animations/MainMascotAnimation";
import { Filter, ArrowDownAZ, ArrowUpZA } from "lucide-react";

const ClassesPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Sort State
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchLessons();
  }, [category]);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      let endpoint = '';

      if (category === 'alpha') {
        endpoint = 'http://localhost:8000/api/lessons/alpha';
      } else if (category === 'number') {
        endpoint = 'http://localhost:8000/api/lessons/number';
      } else if (category === 'gesture') {
        endpoint = 'http://localhost:8000/api/lessons/gesture';
      }

      const response = await fetch(endpoint);
      const data = await response.json();
      setLessons(data.lessons);
    } catch (err) {
      console.error('Error fetching lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter & Sort Logic
  const filteredLessons = lessons.filter(lesson => {
    if (filterLevel === 'all') return true;
    return lesson.difficulty.toLowerCase() === filterLevel.toLowerCase();
  }).sort((a, b) => {
    const titleA = a.title.toLowerCase();
    const titleB = b.title.toLowerCase();
    if (sortOrder === 'asc') {
      return titleA.localeCompare(titleB);
    } else {
      return titleB.localeCompare(titleA);
    }
  });

  const getPageTitle = () => {
    switch (category) {
      case 'alpha': return 'Alphabet Classes';
      case 'number': return 'Number Classes';
      case 'gesture': return 'Gesture Classes';
      default: return 'Classes';
    }
  };

  const getMascotMessage = () => {
    if (filteredLessons.length === 0 && !loading) {
      return "Oh no, I guess we have nothing here for that!";
    }

    switch (category) {
      case 'alpha': return "Let's master the alphabet together!";
      case 'number': return "Ready to count? I'll help you!";
      case 'gesture': return "Express yourself with gestures!";
      default: return "Select a class to begin!";
    }
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <MoonLoader color="#73d9ff" size={70} />
      </div>
    );
  }

  return (
    <div className="container mt-4 text-light">
      {category && (
        <div className="mb-3">
          <Link to="/dashboard/allClasses" className="text-secondary text-decoration-none d-inline-flex align-items-center hover-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left me-2" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
            </svg>
            Back to Categories
          </Link>
        </div>
      )}

      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between mb-5">
        <div className="d-flex align-items-center mb-4 mb-lg-0">
          <div className="position-relative">
            <MainMascotAnimation size={250} />
            <div
              style={{
                width: '160px',
                height: '12px',
                background: 'rgba(104, 197, 255, 0.5)',
                borderRadius: '50%',
                marginTop: '-50px',
                marginLeft: '45px',
                filter: 'blur(0px)'
              }}
            />
          </div>
          <div className="ms-4">
            <h2 className="display-3 mb-2">{getPageTitle()}</h2>
            <div className="p-3 rounded-4 bg-custom-color-dark border border-secondary position-relative" style={{ maxWidth: '400px' }}>
              <p className="text-light mb-0 lead">{getMascotMessage()}</p>
              <div
                className="position-absolute bg-custom-color-dark border-start border-bottom border-secondary"
                style={{
                  width: '20px',
                  height: '20px',
                  left: '-10px',
                  top: '50%',
                  transform: 'translateY(-50%) rotate(45deg)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Filter & Sort Controls */}
        <div className="d-flex gap-3 align-items-center">
          <div className="dropdown">
            <button className="btn btn-outline-secondary btn-sm dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <Filter size={18} />
              {filterLevel === 'all' ? 'All Levels' : filterLevel.charAt(0).toUpperCase() + filterLevel.slice(1)}
            </button>
            <ul className="dropdown-menu dropdown-menu-dark">
              <li><button className="dropdown-item" onClick={() => setFilterLevel('all')}>All Levels</button></li>
              <li><button className="dropdown-item" onClick={() => setFilterLevel('beginner')}>Beginner</button></li>
              <li><button className="dropdown-item" onClick={() => setFilterLevel('intermediate')}>Intermediate</button></li>
              <li><button className="dropdown-item" onClick={() => setFilterLevel('advanced')}>Advanced</button></li>
            </ul>
          </div>

          <button onClick={toggleSort} className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2" title="Toggle Sort Order">
            {sortOrder === 'asc' ? <ArrowDownAZ size={20} /> : <ArrowUpZA size={20} />}
            {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </button>
        </div>
      </div>

      <div className="row g-3 g-md-4">
        {filteredLessons.length > 0 ? (
          filteredLessons.map((lesson) => (
            <div key={lesson.lesson_id} className="col-12 col-sm-6 col-lg-4">
              <ClassCard
                id={lesson.lesson_id}
                title={lesson.title}
                description={lesson.instructions}
                questions={1}
                level={lesson.difficulty}
              />
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5">
            <p className="text-secondary fs-5">No classes found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassesPage;