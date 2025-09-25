import { Routes, Route, Link } from "react-router-dom";
import HomePage from "./app/pages/Home/HomePage";
import SignInPage from "./app/pages/Login/SignInPage";
import Navbar from "./components/navbar/Navbar";
import AboutPage from "./app/pages/About/AboutPage";

export default function App() {
    return (
        <div>
            <nav>
                {/* navigation bar*/}
                <Navbar />
            </nav>
            <Routes>
                {/* Home page */}
                <Route path="/" element={<HomePage />} />
                {/* sign in  and sign up page */}
                <Route path="/login" element={<SignInPage />} />
                <Route path="/about" element={<AboutPage />} />
            </Routes>
        </div>
    );
}
