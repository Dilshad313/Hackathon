import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'REGISTER_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        isAuthenticated: true, 
        user: action.payload.user,
        token: action.payload.token,
        error: null
      };
    case 'LOGIN_FAILURE':
      return { 
        ...state, 
        loading: false, 
        isAuthenticated: false, 
        user: null,
        token: null,
        error: action.payload 
      };
    case 'LOGOUT':
      return { 
        ...state, 
        loading: false,
        isAuthenticated: false, 
        user: null,
        token: null,
        error: null
      };
    case 'REGISTER_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        isAuthenticated: true, 
        user: action.payload.user,
        token: action.payload.token 
      };
    case 'REGISTER_FAILURE':
      return { 
        ...state, 
        loading: false, 
        error: action.payload 
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    token: localStorage.getItem('token'),
    loading: true, // Start with loading true
    error: null
  });

  // Check if user is authenticated on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Set the token in API headers
          api.setAuthToken(token);
          
          // Try admin profile first, then fall back to user profile
          let response;
          try {
            response = await api.get('/admin/auth/profile');
            // Mark as admin
            response.data.type = 'admin';
            if (!response.data.role || response.data.role === 'super-admin') {
              response.data.role = 'admin';
            }
          } catch (adminError) {
            // If admin profile fails, try user profile
            response = await api.get('/users/profile');
          }
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: response.data, token }
          });
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          api.setAuthToken(null);
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        // No token, stop loading
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password, isAdmin = false) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      // Use different endpoint for admin login
      const endpoint = isAdmin ? '/admin/auth/login' : '/users/login';
      const response = await api.post(endpoint, { email, password });
      
      // Handle different response structures
      const token = response.data.token;
      const user = response.data.user || response.data.admin;
      
      // If admin, mark the user object
      if (isAdmin || response.data.admin) {
        user.type = 'admin';
        user.role = user.role || 'admin';
      }
      
      console.log('Login successful, user data:', user);
      console.log('User role:', user.role);
      console.log('User type:', user.type);
      
      localStorage.setItem('token', token);
      api.setAuthToken(token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      });
      
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
      return { success: false, message: errorMessage };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'REGISTER_START' });
    try {
      const response = await api.post('/users/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      api.setAuthToken(token);
      
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: { user, token }
      });
      
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: 'REGISTER_FAILURE',
        payload: errorMessage
      });
      return { success: false, message: errorMessage };
    }
  };

  const registerAnonymous = async () => {
    try {
      const response = await api.post('/users/register-anonymous');
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      api.setAuthToken(token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Anonymous registration failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    api.setAuthToken(null);
    dispatch({ type: 'LOGOUT' });
  };

  const updateUserProfile = async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: response.data, token: state.token }
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Update failed';
      return { success: false, message: errorMessage };
    }
  };

  const value = {
    ...state,
    login,
    register,
    registerAnonymous,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
