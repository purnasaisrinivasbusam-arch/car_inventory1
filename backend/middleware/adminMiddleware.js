const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Access denied. Admin only.' });
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
