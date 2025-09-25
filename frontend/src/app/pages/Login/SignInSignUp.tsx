import { useState } from "react";
import "./Login.css";
import { FaUser, FaLock, FaGoogle, FaApple, FaGithub } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

export default function SignInSignUp() {
  const [action, setAction] = useState("");

  return (
    <div className={`wrapper ${action}  text-white`}>
      {/* Sign in */}
      <div className="form-box login">
        <form>
          <h1>Sign in</h1>
          <div className="input-box">
            <input type="text" placeholder="Username" required />
            <FaUser className="input-icon" />
          </div>
          <div className="input-box">
            <input type="password" placeholder="Password" required />
            <FaLock className="input-icon" />
          </div>

          <div className="remember-forgot">
            <label><input type="checkbox" /> Remember me</label>
            <a href="#">Forgot Password?</a>
          </div>

          <button type="submit" className="btn btn-outline-light rounded-5">Sign in</button>

          <div className="divider"><span>OR</span></div>

          <button type="button" className="btn btn-outline-light rounded-5">
            <FaGoogle className="ssoIcon" /> Continue with Google
          </button>
          <button type="button" className="btn btn-outline-light rounded-5">
            <FaGithub className="ssoIcon" /> Continue with GitHub
          </button>
          <button type="button" className="btn btn-outline-light rounded-5">
            <FaApple className="ssoIcon" /> Continue with Apple
          </button>

          <div className="register-link">
            <p>Don't have an account? <a href="#" onClick={() => setAction("active")}>Sign up</a></p>
          </div>
        </form>
      </div>

      {/* Sign up */}
      <div className="form-box register">
        <form>
          <h1>Sign up</h1>

          <div className="input-box">
            <input type="email" placeholder="Email" required />
            <MdEmail className="input-icon" />
          </div>

          <div className="input-box">
            <input type="text" placeholder="Username" required />
            <FaUser className="input-icon" />
          </div>

          <div className="input-box">
            <input type="password" placeholder="Password" required />
            <FaLock className="input-icon" />
          </div>

          <div className="remember-forgot">
            <label><input type="checkbox" /> I agree to the terms & conditions.</label>
          </div>

          <button type="submit" className="btn btn-outline-light rounded-5">Sign up</button>

          <div className="register-link">
            <p>Already have an account? <a href="#" onClick={() => setAction("")}>Sign in</a></p>
          </div>
        </form>
      </div>
    </div>
  );
}
