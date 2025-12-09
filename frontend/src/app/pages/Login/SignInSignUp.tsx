
import { useState, useEffect } from "react";
import "./Login.css";
import { FaUser, FaLock, FaGoogle, FaApple, FaGithub, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';

export default function SignInSignUp({ initialAction = "" }: { initialAction?: string }) {
  const navigate = useNavigate();
  const [action, setAction] = useState(initialAction);

  useEffect(() => {
    setAction(initialAction);
  }, [initialAction]);

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
  const [showPassword, setShowPassword] = useState(false);
  const toggle = () => setShowPassword(!showPassword);

  const auth = getAuth();

  //input handlers
  const handleLoginChange = (e: any) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterChange = (e: any) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  // OAuth Helper Function
  const handleOAuthLogin = async (idToken: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/oauth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('OAuth User:', data);
        localStorage.setItem('currentUser', JSON.stringify({
          uid: data.uid,
          userName: data.user.userName,
          email: data.user.email,
          createdAt: data.user.createdAt
        }));
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'OAuth login failed');
      }
    } catch (error) {
      setError('Network error during OAuth login');
      console.error(error);
    }
  };

  // Google Sign In
  /*google btn click -> firebase activate popup
  ->on valid verification, returns ID token from firebase
  ->token sent to backend to be approved by oauth for authenticity
  -> on approval, update db and sign in
  **/

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      await handleOAuthLogin(idToken);
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      setError(error.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  // GitHub Sign In
  const handleGitHubSignIn = async () => {
    setLoading(true);
    setError("");

    const provider = new GithubAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      await handleOAuthLogin(idToken);
    } catch (error: any) {
      console.error('GitHub sign-in error:', error);
      setError(error.message || 'GitHub sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Login
  const handleLoginSubmit = async (e: any) => {
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
        localStorage.setItem('currentUser', JSON.stringify({
          uid: data.uid,
          userName: data.user.userName,
          email: data.user.email,
          createdAt: data.user.createdAt
        }));
        navigate('/dashboard');
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

  // Email/Password Registration
  const handleRegisterSubmit = async (e: any) => {
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
        // Auto-login after successful registration
        const loginResponse = await fetch('http://localhost:8000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: registerData.email,
            password: registerData.password
          }),
        });

        if (loginResponse.ok) {
          const data = await loginResponse.json();
          console.log('User auto-logged in:', data);
          localStorage.setItem('currentUser', JSON.stringify({
            uid: data.uid,
            userName: data.user.userName,
            email: data.user.email,
            createdAt: data.user.createdAt
          }));
          // Redirect to Avatar Selection instead of Dashboard
          navigate('/avatar-selection');
        } else {
          // Fallback if auto-login fails
          alert('Registration successful! Please sign in.');
          setAction("");
          setRegisterData({ email: "", userName: "", password: "" });
        }
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

  return (
    <div className={`wrapper ${action} text-white`}>
      {/* Sign in */}
      <div className="form-box login">
        <form onSubmit={handleLoginSubmit}>
          <h1>Sign in</h1>

          {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

          <div className="input-box">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={loginData.email}
              onChange={handleLoginChange}
              required
            />
            <FaUser className="input-icon" />
          </div>

          <div className="input-box">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={handleLoginChange}
              required
            />
            <button type="button" className="password-toggle" onClick={toggle}>
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
            <FaLock className="input-icon" />
          </div>

          <div className="remember-forgot">
            <label><input type="checkbox" /> Remember me</label>
            <a href="#">Forgot Password?</a>
          </div>

          <button type="submit" className="btn btn-outline-light rounded-5" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="divider"><span>OR</span></div>

          <button
            type="button"
            className="btn btn-outline-light rounded-5"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <FaGoogle className="ssoIcon" /> Continue with Google
          </button>

          <button
            type="button"
            className="btn btn-outline-light rounded-5"
            onClick={handleGitHubSignIn}
            disabled={loading}
          >
            <FaGithub className="ssoIcon" /> Continue with GitHub
          </button>

          <button
            type="button"
            className="btn btn-outline-light rounded-5"
            disabled={loading}
          >
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

          {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

          <div className="input-box">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={registerData.email}
              onChange={handleRegisterChange}
              required
            />
            <MdEmail className="input-icon" />
          </div>

          <div className="input-box">
            <input
              type="text"
              name="userName"
              placeholder="Username"
              value={registerData.userName}
              onChange={handleRegisterChange}
              required
            />
            <FaUser className="input-icon" />
          </div>

          <div className="input-box">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={registerData.password}
              onChange={handleRegisterChange}
              required
            />
            <button type="button" className="password-toggle" onClick={toggle}>
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
            <FaLock className="input-icon" />
          </div>

          <div className="remember-forgot">
            <label><input type="checkbox" /> I agree to the terms & conditions.</label>
          </div>

          <button type="submit" className="btn btn-outline-light rounded-5" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign up'}
          </button>

          <div className="register-link">
            <p>Already have an account? <a href="#" onClick={() => setAction("")}>Sign in</a></p>
          </div>
        </form>
      </div>
    </div>
  );
}
