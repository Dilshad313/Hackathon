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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome Back!</h1>
          <p className="text-lg text-gray-600 mb-8">Your mental wellness journey awaits.</p>
          <Link 
            to="/dashboard" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 duration-300 shadow-md hover:shadow-lg"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const features = [
    { title: 'Professional Consultations', description: 'Connect with licensed therapists via video, audio, or chat.', icon: '🩺' },
    { title: 'Therapy Assessments', description: 'Take validated assessments like PHQ-9 to track your progress.', icon: '📝' },
    { title: 'Educational Resources', description: 'Access courses and articles tailored to your mental health needs.', icon: '📚' },
    { title: 'Supportive Community', description: 'Join forums and connect with others on similar journeys anonymously.', icon: '👥' },
    { title: 'Prescription Management', description: 'Digital prescriptions with secure storage and refill requests.', icon: '💊' },
    { title: 'AI-Powered Support', description: '24/7 AI chatbots for immediate, empathetic support and information.', icon: '🧠' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Navigation */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-lg z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="text-2xl font-bold text-blue-600">SoulSync</div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#cta" className="text-gray-600 hover:text-blue-600 transition-colors">Get Started</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Login</Link>
              <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg transition-transform transform hover:scale-105 duration-300 shadow-md hover:shadow-lg">Sign Up</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Your Path to Mental Wellness Starts Here
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Connect with professionals, access therapeutic resources, and join a supportive community dedicated to your well-being.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-lg text-lg transition-transform transform hover:scale-105 duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto">Get Started Now</Link>
            <button
              onClick={handleAnonymousLogin}
              disabled={isAnonymousLoading}
              className="bg-white hover:bg-gray-100 text-blue-600 border border-gray-300 font-bold py-4 px-10 rounded-lg text-lg transition-transform transform hover:scale-105 duration-300 disabled:opacity-50 w-full sm:w-auto"
            >
              {isAnonymousLoading ? 'Loading...' : 'Try Anonymously'}
            </button>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Comprehensive Mental Health Support</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Everything you need for your mental wellness journey, all in one place.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="text-4xl mb-4 text-blue-600">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Take the First Step?</h2>
          <p className="text-lg text-blue-100 mb-8">Join thousands of others who are taking control of their mental wellness with SoulSync.</p>
          <Link to="/register" className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-4 px-10 rounded-lg text-lg transition-transform transform hover:scale-105 duration-300 shadow-md hover:shadow-lg">Create Your Account</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p>&copy; {new Date().getFullYear()} SoulSync. All rights reserved.</p>
            <p className="text-gray-400 mt-2">Your trusted partner in mental wellness.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;