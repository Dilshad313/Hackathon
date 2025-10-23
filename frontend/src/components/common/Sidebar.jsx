import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { name: 'Appointments', href: '/appointments', icon: '📅' },
  { name: 'Meditation', href: '/meditation', icon: '🧘' },
  { name: 'Journal', href: '/journal', icon: '✍️' },
  { name: 'Assessments', href: '/assessments', icon: '📊' },
  { name: 'Courses', href: '/courses', icon: '📚' },
  { name: 'Forum', href: '/forum', icon: '👥' },
  { name: 'Chat', href: '/chat', icon: '💬' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="w-64 bg-white h-screen flex flex-col shadow-lg">
      <div className="p-6 text-2xl font-bold text-blue-600 border-b">
        SoulSync
      </div>
      <nav className="flex-grow p-4">
        <ul>
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={link.href}
                className={`flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${ 
                  location.pathname.startsWith(link.href) 
                  ? 'bg-blue-100 text-blue-600 font-semibold' 
                  : 'text-gray-600 hover:bg-gray-100'
                }`}>
                <span className="mr-3 text-xl">{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center mb-4">
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
          <div className="ml-3">
            <p className="font-semibold text-gray-800">{user?.firstName || user?.username}</p>
            <p className="text-sm text-gray-500">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium transition-colors duration-300">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
