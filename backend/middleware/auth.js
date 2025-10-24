const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');
    
    // Check if no token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mindSyncSecretKey');
    
    // Get user from token
    req.user = await User.findById(decoded.user.id).select('-password');
    
    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');
    
    // Check if no token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mindSyncSecretKey');
    
    // Check if token is for admin (new separate collection)
    if (decoded.admin) {
      // Get admin from Admin collection
      const admin = await Admin.findById(decoded.admin.id).select('-password');
      
      if (!admin) {
        return res.status(401).json({ message: 'Admin not found' });
      }
      
      if (!admin.isActive) {
        return res.status(403).json({ message: 'Admin account is inactive' });
      }
      
      if (admin.isLocked) {
        return res.status(403).json({ message: 'Admin account is locked' });
      }
      
      req.admin = admin;
      req.adminRole = admin.role;
      next();
    } 
    // Fallback: check if it's a user with admin role (old system)
    else if (decoded.user) {
      const user = await User.findById(decoded.user.id).select('-password');
      
      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'Token is not valid' });
      }
      
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin role required.' });
      }
      
      // Map user to admin format for backward compatibility
      req.admin = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: 'super-admin',
        isActive: user.isActive
      };
      req.adminRole = 'super-admin';
      next();
    } else {
      return res.status(401).json({ message: 'Invalid token format' });
    }
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const doctorAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (!['doctor', 'admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied. Doctor role required.' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Authorization failed' });
  }
};

module.exports = { auth, adminAuth, doctorAuth };