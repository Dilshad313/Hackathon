import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine dashboard path based on user role
  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'doctor':
        return '/doctor/dashboard';
      case 'hospital':
        return '/hospital/dashboard';
      default:
        return '/dashboard';
    }
  };

  const dashboardPath = getDashboardPath();
  const isOnDashboard = location.pathname === dashboardPath;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Left side - Title and Dashboard Link */}
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">{title || 'Dashboard'}</h1>
            {!isOnDashboard && (
              <>
                <Link
                  to={dashboardPath}
                  className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition duration-300"
                >
                  <svg 
                    className="w-5 h-5 mr-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                    />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  to="/meditation"
                  className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition duration-300"
                >
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Meditation
                </Link>
              </>
            )}
          </div>

          {/* Right side - User info and Logout */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 hidden sm:block">
              Welcome, {user?.firstName || user?.username}!
            </span>
            
            {/* Profile Picture */}
            <Link to="/profile" className="flex-shrink-0">
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full hover:ring-2 hover:ring-blue-500 transition"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold hover:bg-blue-600 transition">
                  {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </div>
              )}
            </Link>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
