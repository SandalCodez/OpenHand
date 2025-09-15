import { useState } from "react";
import './Login.css'
import { FaUser } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaGoogle } from "react-icons/fa";
import { FaApple } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import handy from "../../../assets/handy.png";

const Login = () => {

    const [action, setAction] = useState('');

    const registerLink = () => {
        setAction('active');
    };

    const loginLink = () => {
        setAction('');
    };

    return (
        <><img className="logo" src={handy} alt="Handy"/>
            <div className={`wrapper ${action}`}>

                <div className="form-box login">

                    <form action="">
                        <h1>Sign in</h1>
                        <div className="input-box">
                            <input type="text" placeholder="Username" required/>
                            <FaUser className="input-icon"/>
                        </div>
                        <div className="input-box">
                            <input type="password" placeholder="Password" required/>
                            <FaLock className="input-icon"/>
                        </div>

                        <div className="remember-forgot">
                            <label><input type="checkbox"/>Remember me</label>
                            <a href="#">Forgot Password?</a>
                        </div>

                        <button type="submit" className="btn">Sign in</button>

                        <div className="divider">
                            <span>OR</span>
                        </div>


                        <button type="submit" className="btn"><FaGoogle className="ssoIcon"/> Continue with Google
                        </button>

                        <button type="submit" className="btn"><FaGithub className="ssoIcon"/> Continue with GitHub
                        </button>
                        <button type="submit" className="btn"><FaApple className="ssoIcon"/> Continue with Apple
                        </button>


                        <div className="register-link">
                            <p>Don't have an account? <a href="#" onClick={registerLink}>Sign up</a></p>
                        </div>

                    </form>
                </div>

                <div className="form-box register">
                    <form action="">
                        <h1>Sign up</h1>
                        <div className="input-box">
                            <input type="email" placeholder="Email" required/>
                            <MdEmail className="input-icon"/>
                        </div>
                        <div className="input-box">
                            <input type="text" placeholder="Username" required/>
                            <FaUser className="input-icon"/>
                        </div>

                        <div className="input-box">
                            <input type="password" placeholder="Password" required/>
                            <FaLock className="input-icon"/>
                        </div>

                        <div className="remember-forgot">
                            <label><input type="checkbox"/>I agree to the terms & conditons.</label>
                        </div>

                        <button type="submit" className="btn">Sign up</button>

                        <div className="register-link">
                            <p>Already have an account? <a href="#" onClick={loginLink}>Sign in</a></p>
                        </div>
                    </form>
                </div>

            </div>
        </>
            );
};

export default Login;