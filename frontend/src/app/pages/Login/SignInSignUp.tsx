import { useState } from "react";
import "./Login.css";
import { FaUser, FaLock, FaGoogle, FaApple, FaGithub } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

export default function SignInSignUp() {
  const [action, setAction] = useState("");

  // state variables
    const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  
  const [registerData, setRegisterData] = useState({
    email: "",
    userName: "",
    password: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  //state varibales END

  //input handlers
    const handleLoginChange = (e:any) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterChange = (e:any) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };
// end input handler
//form submit
const handleLoginSubmit = async (e:any) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const response = await fetch('http://localhost:8000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('User:', data);
      alert(`Login successful! Welcome ${data.user.userName}. Your UID is: ${data.uid}`);
      // direct to dashboard with respect to UID
    } else {
      const errorData = await response.json();
      setError(errorData.detail || 'Login failed');
    }
  } catch (error) {
    setError('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
};

// Handle registration
const handleRegisterSubmit = async (e:any) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const response = await fetch('http://localhost:8000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
    });

    if (response.ok) {
      alert('Registration successful!!!!!!!');
      setAction(""); // Switch to login form
      setRegisterData({ email: "", userName: "", password: "" });
    } else {
      const errorData = await response.json();
      setError(errorData.detail || 'Registration failed');
    }
  } catch (error) {
    setError('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
};
//end form submit
  


  return (
    <div className={`wrapper ${action}  text-white`}>
      {/* Sign in */}
      <div className="form-box login">
        <form onSubmit={handleLoginSubmit}>
          <h1>Sign in</h1>
          <div className="input-box">
            <input type="email" name = "email" placeholder="Email" value={loginData.email} onChange={handleLoginChange} required />
            <FaUser className="input-icon" />
          </div>
          <div className="input-box">
            <input type="password" name= "password"placeholder="Password" value={loginData.password} onChange={handleLoginChange} required />
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
        <form onSubmit={handleRegisterSubmit}>
          <h1>Sign up</h1>

          <div className="input-box">
            <input type="email" name = "email" placeholder="Email" value={registerData.email} onChange={handleRegisterChange} required />
            <MdEmail className="input-icon" />
          </div>

          <div className="input-box">
            <input type="text" name = "userName" placeholder="Username" value={registerData.userName} onChange={handleRegisterChange} required />
            <FaUser className="input-icon" />
          </div>

          <div className="input-box">
            <input type="password" name="password" placeholder="Password" value={registerData.password} onChange={handleRegisterChange} required />
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
