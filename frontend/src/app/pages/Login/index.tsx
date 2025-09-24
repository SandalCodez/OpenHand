/**
 * Nadir please look over.
 *
 * To do
 *
 * on hover for the buttons
 *
 * Add functionality to the buttons
 *
 * Add social sign on with google github and apple
 */

// To do
import React, { useState } from "react";
// import styles for the login page
import './Login.css'
// import the icons for react
import { FaUser, FaLock, FaGoogle, FaApple, FaGithub, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
// import the logo
import handy from "../../../assets/handy.png";

const Login = () => {

    // Create 2 states for password masking button
    // this will make sure it is invisible or not
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // toggle function for password masking button
    const toggle = () => setShowPassword(!showPassword);

    const [action, setAction] = useState('');

    // button to switch to the register page
    const registerLink = () => {
        setAction('active');
    };

    // button to switch to the login page
    const loginLink = () => {
        setAction('');
    };

    return (
        // puts the logo on top of the page?
        // Should it go in the box or outside?
        <><img className="logo" src={handy} alt="Handy"/>
            <div className={`wrapper ${action}`}>

                <div className="form-box login">

                    <form action="">
                        <h1>Sign in</h1>
                        <div className="input-box">
                            {/* user name text field*/}
                            <input type="text" placeholder="Username" required/>
                            <FaUser className="input-icon"/>
                        </div>

                        <div className="input-box">
                            <input
                                // show text if show password is true, otherwise mask the password
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={toggle}
                            >
                                {/* If show password is true it will show to regular eye
                                 otherwise it will show the slash eye */}
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </button>

                            <FaLock className="input-icon" />
                        </div>

                        <div className="remember-forgot">
                            <label><input type="checkbox"/>Remember me</label>
                            <a href="#">Forgot Password?</a>
                        </div>

                        <button type="submit" className="btn">Sign in</button>

                        <div className="divider">
                            <span>OR</span>
                        </div>

                        {/* buttons for social sign on google github and apple*/}


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
                            <input
                                // show text if show password is true, otherwise mask the password
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={toggle}
                            >
                                {/* If show password is true it will show to regular eye
                                 otherwise it will show the slash eye */}
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </button>




                            <FaLock className="input-icon" />
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