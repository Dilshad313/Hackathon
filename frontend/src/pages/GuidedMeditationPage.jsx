import React, { useState } from 'react';

// Placeholder data - replace with data from your backend
const meditationSessions = [
  {
    id: 1,
    title: 'Morning Relaxation',
    description: 'Start your day with a calm and focused mind. This session helps reduce anxiety.',
    duration: '10 min',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    category: 'Anxiety',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-4e63a4b5b4ae?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
  },
  {
    id: 2,
    title: 'Deep Sleep',
    description: 'A guided meditation to help you fall into a deep and restful sleep.',
    duration: '15 min',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    category: 'Sleep',
    thumbnail: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
  },
  {
    id: 3,
    title: 'Stress Relief',
    description: 'Release tension and stress from your body and mind with this guided session.',
    duration: '12 min',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    category: 'Stress',
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1220&q=80',
  },
  {
    id: 4,
    title: 'Focus and Concentration',
    description: 'Improve your focus and concentration for work or study.',
    duration: '8 min',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    category: 'Focus',
    thumbnail: 'https://images.unsplash.com/photo-1474540412665-1cdae210ae6b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
  },
];

const AudioPlayer = ({ session, onClose }) => {
  if (!session) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{session.title}</h2>
        <p className="text-gray-600 mb-6">{session.description}</p>
        <audio controls autoPlay className="w-full">
          <source src={session.audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  );
};

const GuidedMeditationPage = () => {
  const [activeSession, setActiveSession] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800">Find Your Inner Peace</h1>
          <p className="text-lg text-gray-600 mt-2">Select a session below to begin your meditation practice.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {meditationSessions.map((session) => (
            <div 
              key={session.id} 
              className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer group"
              onClick={() => setActiveSession(session)}
            >
              <div className="relative">
                <img src={session.thumbnail} alt={session.title} className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-all duration-300"></div>
                <span className="absolute top-4 left-4 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">{session.category}</span>
                <span className="absolute bottom-4 right-4 bg-white text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">{session.duration}</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{session.title}</h3>
                <p className="text-gray-600 text-sm">{session.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <AudioPlayer session={activeSession} onClose={() => setActiveSession(null)} />
    </div>
  );
};

export default GuidedMeditationPage;
