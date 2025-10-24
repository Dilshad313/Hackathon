import React from 'react';
import { useAuth } from '../../context/AuthContext';

const DebugAuth = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <div className="font-bold mb-2">Auth Debug Info:</div>
      <div>Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
      <div>Loading: {loading ? '⏳ Yes' : '✅ No'}</div>
      {user && (
        <>
          <div className="mt-2 font-semibold">User Info:</div>
          <div>Email: {user.email || 'N/A'}</div>
          <div>Role: {user.role || 'N/A'}</div>
          <div>Type: {user.type || 'N/A'}</div>
          <div>Username: {user.username || 'N/A'}</div>
          <div className="mt-2 text-xs opacity-75">
            Full user object in console
          </div>
        </>
      )}
    </div>
  );
};

export default DebugAuth;
