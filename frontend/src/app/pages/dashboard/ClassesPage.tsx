import React from "react";
import ClassCard from "../../../components/cards/ClassCard";
import { classesData } from "../../../assets/classes/Classes";


const ClassesPage: React.FC = () => {
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
