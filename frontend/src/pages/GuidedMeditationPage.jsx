import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Clock, Sparkles, Volume2, Pause } from 'lucide-react';

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
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <AnimatePresence>
      {session && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl p-8 max-w-md w-full relative border border-blue-100"
          >
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose} 
              className="absolute top-4 right-4 w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </motion.button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{session.title}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {session.duration}
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed">{session.description}</p>
            
            <div className="bg-white rounded-xl p-4 shadow-inner">
              <audio controls autoPlay className="w-full" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)}>
                <source src={session.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
            
            <motion.div
              animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
              className="mt-6 text-center"
            >
              <span className="inline-flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-blue-600" />
                {isPlaying ? 'Now Playing' : 'Paused'}
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const GuidedMeditationPage = () => {
  const [activeSession, setActiveSession] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full mb-6 border border-blue-200">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">Guided Meditation Sessions</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Find Your Inner Peace
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Select a session below to begin your meditation practice and enhance your mental wellness.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {meditationSessions.map((session, index) => (
            <motion.div 
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              onHoverStart={() => setHoveredId(session.id)}
              onHoverEnd={() => setHoveredId(null)}
              className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer group border border-gray-100"
              onClick={() => setActiveSession(session)}
            >
              <div className="relative overflow-hidden">
                <motion.img 
                  src={session.thumbnail} 
                  alt={session.title} 
                  className="w-full h-56 object-cover"
                  animate={{ scale: hoveredId === session.id ? 1.1 : 1 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                
                {/* Play Button Overlay */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: hoveredId === session.id ? 1 : 0,
                    scale: hoveredId === session.id ? 1 : 0.8
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl">
                    <Play className="w-8 h-8 text-blue-600 ml-1" fill="currentColor" />
                  </div>
                </motion.div>
                
                <span className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                  {session.category}
                </span>
                <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-2 rounded-full shadow-lg">
                  <Clock className="w-3 h-3" />
                  {session.duration}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">{session.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{session.description}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" fill="currentColor" />
                  Start Session
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
      <AudioPlayer session={activeSession} onClose={() => setActiveSession(null)} />
    </div>
  );
};

export default GuidedMeditationPage;
