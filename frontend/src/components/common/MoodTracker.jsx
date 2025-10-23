import React, { useState } from 'react';
import api from '../../services/api'; // Import the api service
import { toast } from 'react-toastify';

const moods = [
  { mood: 'awful', emoji: '😞', color: 'red' },
  { mood: 'bad', emoji: '😟', color: 'orange' },
  { mood: 'okay', emoji: '😐', color: 'yellow' },
  { mood: 'good', emoji: '😊', color: 'green' },
  { mood: 'great', emoji: '😄', color: 'teal' },
];

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedMood) return;

    setLoading(true);
    try {
      await api.post('/users/mood', { mood: selectedMood.mood });
      setSubmitted(true);
      toast.success('Mood successfully logged!');
    } catch (error) {
      console.error('Error submitting mood:', error);
      const errorMessage = error.response?.data?.msg || 'Failed to submit mood. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Thank you!</h2>
        <p className="text-gray-600">Your mood has been logged for today.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">How are you feeling today?</h2>
      <div className="flex justify-around items-center mb-6">
        {moods.map((mood) => (
          <button
            key={mood.mood}
            onClick={() => setSelectedMood(mood)}
            className={`p-3 rounded-full transition-transform transform hover:scale-110 ${selectedMood?.mood === mood.mood ? 'bg-blue-100 ring-2 ring-blue-500' : ''}`}>
            <span className="text-4xl">{mood.emoji}</span>
          </button>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={!selectedMood || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
        {loading ? 'Submitting...' : 'Submit Mood'}
      </button>
    </div>
  );
};

export default MoodTracker;
