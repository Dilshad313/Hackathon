import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  let isAuthenticated, user, loading;
  
  try {
    const authContext = useAuth();
    isAuthenticated = authContext.isAuthenticated;
    user = authContext.user;
    loading = authContext.loading;
  } catch (error) {
    console.error('Auth context error:', error);
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user's role is in allowed roles
  if (allowedRoles.length > 0) {
    const userRole = user?.role;
    const userType = user?.type;
    
    console.log('PrivateRoute check:', {
      userRole,
      userType,
      allowedRoles,
      user
    });
    
    // Check if user is admin (handle both 'admin' and 'super-admin' roles, and type='admin')
    const isAdmin = userRole === 'admin' || userRole === 'super-admin' || 
                    userRole === 'moderator' || userRole === 'content-manager' || 
                    userRole === 'support-agent' || userType === 'admin';
    
    console.log('Is admin?', isAdmin);
    
    // If route requires admin and user is admin, allow access
    if (allowedRoles.includes('admin') && isAdmin) {
      console.log('✅ Admin access granted');
      return children;
    }
    
    // Otherwise check if user's role is in allowed roles
    if (!allowedRoles.includes(userRole)) {
      // Redirect based on user type
      if (isAdmin) {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (userRole === 'doctor') {
        return <Navigate to="/doctor/dashboard" replace />;
      } else if (userRole === 'hospital') {
        return <Navigate to="/hospital/dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return children;
};

export default PrivateRoute;