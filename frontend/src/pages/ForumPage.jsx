import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import NotificationService from '../utils/notifications';

const ForumPage = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchForumData();
  }, [activeCategory, searchTerm]);

  const fetchForumData = async () => {
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.append('category', activeCategory);
      if (searchTerm) params.append('search', searchTerm);
      params.append('sort', '-createdAt');

      const response = await api.get(`/forum/posts?${params}`);
      setPosts(response.data.posts);
      
      // Get all categories
      const categoriesResponse = await api.get('/forum/categories');
      setCategories(categoriesResponse.data.categories);
    } catch (error) {
      NotificationService.error('Failed to load forum data');
      console.error('Error fetching forum data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      anxiety: 'bg-yellow-100 text-yellow-800',
      depression: 'bg-blue-100 text-blue-800',
      relationships: 'bg-pink-100 text-pink-800',
      stress: 'bg-orange-100 text-orange-800',
      grief: 'bg-purple-100 text-purple-800',
      trauma: 'bg-red-100 text-red-800',
      selfcare: 'bg-green-100 text-green-800',
      meditation: 'bg-indigo-100 text-indigo-800',
      general: 'bg-gray-100 text-gray-800',
      supportgroups: 'bg-teal-100 text-teal-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Community Forum</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                    activeCategory === 'all'
                      ? 'bg-blue-100 text-blue-800 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All Topics
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      activeCategory === category
                        ? `bg-blue-100 text-blue-800 font-medium ${getCategoryColor(category).replace('bg-', 'bg-').replace('text-', 'text-')}`
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Forum Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Posts</span>
                  <span className="font-medium">{posts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-medium">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">New Today</span>
                  <span className="font-medium">24</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Search and New Post */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search forum posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <Link
                  to="/forum/new"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition duration-300 whitespace-nowrap"
                >
                  + New Post
                </Link>
              </div>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <div className="text-gray-400 text-6xl mb-4">💬</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Posts Found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? 'No posts match your search.' : 'Be the first to start a discussion in this category.'}
                  </p>
                  {!searchTerm && (
                    <Link
                      to="/forum/new"
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300"
                    >
                      Create Post
                    </Link>
                  )}
                </div>
              ) : (
                posts.map(post => (
                  <div key={post._id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {post.anonymousAuthorName ? (
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold">
                            {post.anonymousAuthorName.charAt(0)}
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            {getInitials(post.authorId.username)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                              <Link to={`/forum/post/${post._id}`}>
                                {post.title}
                              </Link>
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm text-gray-500">
                                {post.anonymousAuthorName || post.authorId.username}
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="text-sm text-gray-500">
                                {new Date(post.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                            {post.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {post.content}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>👍 {post.upvotes}</span>
                            <span>👎 {post.downvotes}</span>
                            <span>👁️ {post.viewCount}</span>
                            <span>💬 {post.comments?.length || 0}</span>
                          </div>
                          
                          <Link
                            to={`/forum/post/${post._id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Read more →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination would go here in a full implementation */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForumPage;