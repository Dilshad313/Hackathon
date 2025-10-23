import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const adminNavLinks = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { name: 'Manage Doctors', href: '/admin/doctors', icon: '👨‍⚕️' },
  { name: 'Manage Users', href: '/admin/users', icon: '👥' },
  { name: 'Manage Hospitals', href: '/admin/hospitals', icon: '🏥' },
  { name: 'Manage Courses', href: '/admin/courses', icon: '📚' },
  { name: 'Forum Moderation', href: '/admin/forum', icon: '🛡️' },
];

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="w-64 bg-gray-800 text-white h-screen flex flex-col shadow-lg">
      <div className="p-6 text-2xl font-bold border-b border-gray-700">
        SoulSync Admin
      </div>
      <nav className="flex-grow p-4">
        <ul>
          {adminNavLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={link.href}
                className={`flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${ 
                  location.pathname.startsWith(link.href) 
                  ? 'bg-blue-600 text-white font-semibold' 
                  : 'text-gray-300 hover:bg-gray-700'
                }`}>
                <span className="mr-3 text-xl">{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <Link to="/dashboard" className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300 mb-4">
          Back to Main Site
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300">
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
