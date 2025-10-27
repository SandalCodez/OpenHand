import React from "react";
import { Link } from "react-router-dom";

export type Level = "beginner" | "intermediate" | "advanced";

export type ClassCardProps = {
  id: string;                 // slug or id
  title: string;
  description: string;
  questions: number;
  level: Level;
  // leave images optional for now
  imageSrc?: string;          // e.g. "/images/letters.png"
  imageAlt?: string;
};

const levelBadge: Record<Level, string> = {
  beginner: "bg-success",
  intermediate: "bg-warning text-dark",
  advanced: "bg-danger",
};

const ClassCard: React.FC<ClassCardProps> = ({
  id,
  title,
  description,
  questions,
  level,
  imageSrc,
  imageAlt = title,
}) => {
  return (
    <div className="card bg-custom-color-dark border border-light rounded-4 shadow-sm h-100">
      <div className="card-body d-flex flex-column text-light">
        {/* media (optional) */}
        <div className="d-flex justify-content-center mb-3">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={imageAlt}
              style={{ width: 120, height: 120, objectFit: "contain" }}
            />
          ) : (
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-3"
              style={{ width: 120, height: 120, border: "1px dashed #4b5563" }}
            >
              <span className="text-secondary small">image</span>
            </div>
          )}
        </div>

        <h5 className="fw-semibold mb-1">{title}</h5>
        <div className="text-secondary small mb-2">
          {questions} questions • <span className="text-capitalize">{level}</span>
        </div>
        <p className="mb-3 flex-grow-1">{description}</p>

        <div className="d-flex align-items-center justify-content-between">
          <span className={`badge rounded-4 ${levelBadge[level]} text-uppercase `}>{level}</span>
          <Link to={`/dashboard/actionHome/`} className="btn btn-outline-light rounded-pill">
            Start the Class
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClassCard;
