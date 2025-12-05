import { Link } from "react-router-dom";
import { HandIcon, CaseUpper, Tally5 } from "lucide-react";
import MainMascotAnimation from "../../../components/animations/MainMascotAnimation";

function AllClassesPage() {
    const categories = [
        {
            id: 'alpha',
            title: 'Alphabet',
            description: 'Learn A-Z of American Sign Language. Perfect for beginners starting their journey.',
            color: 'bg-primary',
            icon: <CaseUpper size={30} className="text-white" />
        },
        {
            id: 'number',
            title: 'Numbers',
            description: 'Master counting and numbers in ASL. Essential for dates, times, and quantities.',
            color: 'bg-success',
            icon: <Tally5 size={30} className="text-white" />
        },
        {
            id: 'gesture',
            title: 'Gestures',
            description: 'Common phrases and daily gestures to help you communicate effectively.',
            color: 'bg-info',
            icon: <HandIcon size={30} className="text-white" />
        }
    ];

    return (
        <div className="container mt-4">
            <div className="d-flex align-items-center mb-5">
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
                    <h1 className="display-3 mb-2 text-white">All Classes</h1>
                    <div className="p-3 rounded-4 bg-custom-color-dark border border-secondary position-relative" style={{ maxWidth: '400px' }}>
                        <p className="text-light mb-0 lead">Choose a category to start learning!</p>
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

            <div className="row g-4">
                {categories.map((cat) => (
                    <div key={cat.id} className="col-12 col-md-4">
                        <Link to={`/dashboard/classes/${cat.id}`} className="text-decoration-none">
                            <div className="card h-100 bg-custom-color-dark border border-secondary rounded-4 shadow-sm hover-scale transition-all">
                                <div className="card-body p-4 d-flex flex-column">
                                    <div className={`rounded-circle ${cat.color} bg-opacity-25 p-3 d-inline-flex align-items-center justify-content-center mb-4`} style={{ width: '64px', height: '64px' }}>
                                        {cat.icon}
                                    </div>
                                    <h3 className="card-title text-white fw-bold mb-3">{cat.title}</h3>
                                    <p className="card-text text-secondary mb-4 flex-grow-1">{cat.description}</p>
                                    <div className="d-flex align-items-center text-primary fw-semibold">
                                        View Classes
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right ms-2" viewBox="0 0 16 16">
                                            <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AllClassesPage;

