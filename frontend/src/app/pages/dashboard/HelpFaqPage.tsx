//import {Link} from "react-router-dom";
import MainMascotAnimation from "../../../components/animations/MainMascotAnimation";
//import React from "react";
import "./HelpFaqPage.css";

function HelpFaqPage() {
    const categories = [
        {
            id: 'alpha',
            title: 'Is my data being collected?',
            description: 'NO! Although we would love to collect the data of the successful phrases, words and numbers to continue to train our AI model it simply isn\'t possible...yet.'
        },
        {
            id: 'beta',
            title: 'How do I complete my next lesson?',
            description: 'On the homepage, it will have youir next lesson ready for you at all times, or if you want to do a specific lesson you can navigate through the classes tab to a specific one' +
                'After selecting what lesson you would like to use You can complete that lesson in the homepage.'
        },
        {
            id: 'charlie',
            title: 'Who\'s the best professor in the world?',
            description: 'Dr. Lorraine Greenwald!'
        }
    ];

    return (
        <div className="container mt-4">
            <div className="d-flex align-items-center mb-5">
                <div className="position-relative">
                    <MainMascotAnimation size={250}/>
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
                    <h1 className="display-3 mb-2 text-white">Help and FAQ</h1>
                    <div className="p-3 rounded-4 bg-custom-color-dark border border-secondary position-relative"
                         style={{maxWidth: '400px'}}>
                        <p className="text-light mb-0 lead">If your question isn't answered here please email us at
                            openhandcsc490@gmail.com!</p>
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
                        <div
                            className="card h-100 bg-custom-color-dark border border-secondary rounded-4 shadow-sm hover-scale transition-all">
                            <div className="card-body p-4 d-flex flex-column">
                                <h3 className="card-title text-white fw-bold mb-3">{cat.title}</h3>
                                <p className="card-text text-secondary mb-4 flex-grow-1">{cat.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="row g-3">
                <div className="col-12 col-xl-6">
                    <div className="card bg-custom-color-dark border border-white rounded-4 h-100">
                        <div className="card-body ">
                            <h2 className="card-title h4 text-white mb-3">Profile</h2>
                            <div className="row g-2">
                                <div className="card-body p-4 d-flex flex-column">
                                    <p className="card-text text-secondary mb-4 flex-grow-1">Profile page breakdown. If it can be clicked in needs to be explained. </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-xl-6">
                    <div className="card bg-custom-color-dark border border-white rounded-4 h-100">
                        <div className="card-body ">
                            <h2 className="card-title h4 text-white mb-3">Home Page</h2>
                            <div className="row g-2">
                                <div className="card-body p-4 d-flex flex-column">
                                    <p className="card-text text-secondary mb-4 flex-grow-1">Home page breakdown. If it can be clicked in needs to be explained.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row g-3">
                <div className="col-12 col-xl-6">
                    <div className="card bg-custom-color-dark border border-white rounded-4 h-100">
                        <div className="card-body ">
                            <h2 className="card-title h4 text-white mb-3">Classes</h2>
                            <div className="row g-2">
                                <div className="card-body p-4 d-flex flex-column">
                                    <p className="card-text text-secondary mb-4 flex-grow-1">Classes page breakdown. If it can be clicked in needs to be explained.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-xl-6">
                    <div className="card bg-custom-color-dark border border-white rounded-4 h-100">
                        <div className="card-body ">
                            <h2 className="card-title h4 text-white mb-3">Road Map</h2>
                            <div className="row g-2">
                                <div className="card-body p-4 d-flex flex-column">
                                    <p className="card-text text-secondary mb-4 flex-grow-1">Road map breakdown. If it can be clicked in needs to be explained.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-3">
                <div className="col-12 col-xl-6">
                    <div className="card bg-custom-color-dark border border-white rounded-4 h-100">
                        <div className="card-body ">
                            <h2 className="card-title h4 text-white mb-3">Settings</h2>
                            <div className="row g-2">
                                <div className="card-body p-4 d-flex flex-column">
                                    <p className="card-text text-secondary mb-4 flex-grow-1">Settings page breakdown. If it can be clicked in needs to be explained.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-xl-6">
                    <div className="card bg-custom-color-dark border border-white rounded-4 h-100">
                        <div className="card-body ">
                            <h2 className="card-title h4 text-white mb-3">XP Button</h2>
                            <div className="row g-2">
                                <div className="card-body p-4 d-flex flex-column">
                                    <p className="card-text text-secondary mb-4 flex-grow-1">XP button breakdown. If it can be clicked in needs to be explained.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default HelpFaqPage;

