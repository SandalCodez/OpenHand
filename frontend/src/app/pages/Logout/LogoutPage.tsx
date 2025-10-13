import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Call backend to clear session
        await fetch('http://localhost:8000/api/logout', {
          method: 'POST',
        });
        
        // Clear frontend localStorage
        localStorage.removeItem('currentUser');
        console.log('Logged out successfully')
        
        // Redirect to login
        navigate('/login');
      } catch (error) {
        console.error('Logout error:', error);
        // Redirect anyway even if backend call fails
        navigate('/login');
      }
    };

    handleLogout();
  }, [navigate]);

  return (
    <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>
      Logging out...
    </div>
  );
}