import { Routes, Route, Link } from "react-router-dom";
import Home from "./app/pages/Home";
import Login from "./app/pages/Login";

export default function App() {
    return (
        <div>
            <nav>
                <Link to="/">Home</Link> | <Link to="/login">Login</Link>
            </nav>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </div>
    );
}
