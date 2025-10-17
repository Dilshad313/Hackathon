import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated, registerAnonymous } = useAuth();
  const [isAnonymousLoading, setIsAnonymousLoading] = useState(false);

  const handleAnonymousLogin = async () => {
    setIsAnonymousLoading(true);
    try {
      await registerAnonymous();
    } catch (error) {
      console.error('Anonymous login failed:', error);
    } finally {
      setIsAnonymousLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome Back!</h1>
          <p className="text-xl text-gray-600 mb-8">Continue your mental wellness journey</p>
          <Link 
            to="/dashboard" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition duration-300"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="text-xl font-bold text-blue-600">MindSync</div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Mental Wellness Journey Starts Here
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Connect with mental health professionals, access therapeutic resources, and join a supportive community.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link 
              to="/register" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full text-lg transition duration-300"
            >
              Get Started
            </Link>
            
            <button
              onClick={handleAnonymousLogin}
              disabled={isAnonymousLoading}
              className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 font-bold py-4 px-8 rounded-full text-lg transition duration-300 disabled:opacity-50"
            >
              {isAnonymousLoading ? 'Loading...' : 'Try Anonymously'}
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Mental Health Support</h2>
            <p className="text-xl text-gray-600">All the tools you need in one place</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-blue-600 text-3xl mb-4">🩺</div>
              <h3 className="text-xl font-semibold mb-2">Professional Consultations</h3>
              <p className="text-gray-600">Connect with licensed mental health professionals through video, audio, or chat consultations.</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-blue-600 text-3xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">Therapy Assessments</h3>
              <p className="text-gray-600">Take validated assessments like PHQ-9 to track your mental health journey.</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-blue-600 text-3xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">Educational Resources</h3>
              <p className="text-gray-600">Access courses and resources tailored to your mental health needs.</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-blue-600 text-3xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">Supportive Community</h3>
              <p className="text-gray-600">Join forums and connect with others on similar journeys.</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-blue-600 text-3xl mb-4">💊</div>
              <h3 className="text-xl font-semibold mb-2">Prescription Management</h3>
              <p className="text-gray-600">Digital prescriptions with secure storage and refill requests.</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-blue-600 text-3xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Support</h3>
              <p className="text-gray-600">24/7 AI chatbots for immediate support and information.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of users taking control of their mental wellness.</p>
          <Link 
            to="/register" 
            className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-full text-lg transition duration-300"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;