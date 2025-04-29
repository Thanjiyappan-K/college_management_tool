const { adminModel } = require('../models/user');
const { ROLES } = require('../models/role');

const adminController = {
  // Get all admins
  getAllAdmins: async (req, res) => {
    try {
      // Only site admins should be able to view all admins
      if (req.user.role !== ROLES.SITE_ADMIN) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const admins = await adminModel.getAll();
      res.json(admins);
    } catch (error) {
      console.error("Error fetching admins:", error);
      res.status(500).json({ message: "Failed to fetch admins" });
    }
  }
};

module.exports = adminController;