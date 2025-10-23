import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Search, 
  Filter, 
  X, 
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Video,
  FileText,
  DollarSign
} from 'lucide-react';
import api from '../services/api';
import NotificationService from '../utils/notifications';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: 'Stress Management',
    duration: '',
    level: 'Beginner',
    price: 0,
    thumbnail: '',
    content: {
      modules: [
        {
          title: '',
          description: '',
          lessons: [
            {
              title: '',
              type: 'video',
              content: '',
              duration: ''
            }
          ]
        }
      ]
    }
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'Stress Management',
    'Anxiety Relief',
    'Depression Support',
    'Mindfulness',
    'Meditation',
    'Sleep Improvement',
    'Relationship Skills',
    'Self-Esteem',
    'Anger Management',
    'Trauma Recovery'
  ];

  useEffect(() => {
    fetchCourses();
  }, [pagination.currentPage, statusFilter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/courses', {
        params: {
          page: pagination.currentPage,
          limit: 10,
          adminApprovalStatus: statusFilter
        }
      });
      setCourses(response.data.courses);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      NotificationService.error('Failed to fetch courses');
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/admin/courses/add', newCourse);
      NotificationService.success('Course added successfully!');
      setShowAddModal(false);
      setNewCourse({
        title: '',
        description: '',
        category: 'Stress Management',
        duration: '',
        level: 'Beginner',
        price: 0,
        thumbnail: '',
        content: {
          modules: [
            {
              title: '',
              description: '',
              lessons: [
                {
                  title: '',
                  type: 'video',
                  content: '',
                  duration: ''
                }
              ]
            }
          ]
        }
      });
      fetchCourses();
    } catch (error) {
      NotificationService.error(error.response?.data?.message || 'Failed to add course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproval = async (courseId, status) => {
    try {
      await api.put(`/admin/courses/${courseId}/approve`, { status });
      NotificationService.success(`Course ${status} successfully`);
      fetchCourses();
      setShowDetailsModal(false);
    } catch (error) {
      NotificationService.error('Failed to update course status');
    }
  };

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setShowDetailsModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Course Management
              </h1>
              <p className="text-gray-600">Manage educational courses and approvals</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              Add Course
            </motion.button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100"
        >
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex gap-2">
              {['pending', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setPagination(prev => ({ ...prev, currentPage: 1 }));
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    statusFilter === status
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Courses Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
              />
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-20 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No {statusFilter} courses found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100"
                >
                  {course.thumbnail && (
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-blue-600" />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-2">{course.title}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        course.adminApprovalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                        course.adminApprovalStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {course.adminApprovalStatus === 'approved' && <CheckCircle className="w-3 h-3" />}
                        {course.adminApprovalStatus === 'rejected' && <XCircle className="w-3 h-3" />}
                        {course.adminApprovalStatus === 'pending' && <Clock className="w-3 h-3" />}
                        {course.adminApprovalStatus}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-semibold text-gray-900">{course.category}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Level:</span>
                        <span className="font-semibold text-gray-900">{course.level}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold text-gray-900">{course.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-semibold text-green-600">
                          {course.price === 0 ? 'Free' : `₹${course.price}`}
                        </span>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleViewDetails(course)}
                      className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 font-semibold py-2 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                {pagination.currentPage}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </motion.div>
      </main>

      {/* Add Course Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative my-8"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                Add New Course
              </h2>

              <form onSubmit={handleAddCourse} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="Course title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="Course description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={newCourse.category}
                      onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Level *
                    </label>
                    <select
                      required
                      value={newCourse.level}
                      onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Duration *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCourse.duration}
                      onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      placeholder="e.g., 4 weeks"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newCourse.price}
                      onChange={(e) => setNewCourse({ ...newCourse, price: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      placeholder="0 for free"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={newCourse.thumbnail}
                    onChange={(e) => setNewCourse({ ...newCourse, thumbnail: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Add Course
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative my-8"
            >
              <button
                onClick={() => setShowDetailsModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Details</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Title</label>
                  <p className="text-lg text-gray-900">{selectedCourse.title}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Description</label>
                  <p className="text-gray-900">{selectedCourse.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Category</label>
                    <p className="text-gray-900">{selectedCourse.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Level</label>
                    <p className="text-gray-900">{selectedCourse.level}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Duration</label>
                    <p className="text-gray-900">{selectedCourse.duration}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Price</label>
                    <p className="text-green-600 font-semibold">
                      {selectedCourse.price === 0 ? 'Free' : `₹${selectedCourse.price}`}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Status</label>
                  <p className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedCourse.adminApprovalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                    selectedCourse.adminApprovalStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedCourse.adminApprovalStatus}
                  </p>
                </div>
                {selectedCourse.instructorId && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Instructor</label>
                    <p className="text-gray-900">
                      {selectedCourse.instructorId.firstName} {selectedCourse.instructorId.lastName}
                    </p>
                  </div>
                )}
              </div>

              {selectedCourse.adminApprovalStatus === 'pending' && (
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleApproval(selectedCourse._id, 'approved')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleApproval(selectedCourse._id, 'rejected')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCourses;
