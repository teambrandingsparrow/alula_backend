// controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Shop from '../models/Shop.js';

export const register = async (req, res) => {
  const { name, email, password, contact, role } = req.body;
  try {

    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists...!' });
    }

    const existingShop = await Shop.findOne({ email: normalizedEmail });
    if (existingShop) {
      return res.status(400).json({ message: 'Email already exists...!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      // email,
      email: normalizedEmail,
      password: hashedPassword,
      contact,
      role,
      isApproved: role === 'admin' ? true : false,
      createdBy: req.user.id,
      creatorRole: req.user.role,
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log('req.body :', req.body);
  try {
    // const user = await User.findOne({ email });
    const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });

    console.log('user :', user);

    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.role === 'vendor' && !user.isApproved) {
      return res.status(403).json({ message: 'Vendor not approved yet' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; 

    if (!token) {
      return res.status(401).json({ valid: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ valid: false, message: "User not found" });
    }

    res.status(200).json({
      valid: true,
      user: {
        id: user._id,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ valid: false, message: "Invalid token" });
  }
};

export const approveVendor = async (req, res) => {
  try {
    const vendor = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const rejectVendor = async (req, res) => {
  try {
    const vendor = await User.findByIdAndUpdate(
      req.params.id,
      { approved: false },
      { new: true }
    );
    res.status(200).json({ message: 'Vendor rejected', vendor });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting vendor', error });
  }
};

export const deleteMyVendor = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Vendor deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting vendor', error });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); 
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor', isApproved: true }).select('-password');
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getMyVendorsApproved = async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor',createdBy: req.user.id,isApproved:true }).select('+password'); 
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyVendorsNotApproved = async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor',createdBy: req.user.id,isApproved:false }).select('+password'); 
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// export const getMyVendorStats = async (req, res) => {
//   try { 

//     const [approvedCount, notApprovedCount] = await Promise.all([
//       User.countDocuments({ role: 'vendor', createdBy:req.user.id, isApproved: true }),
//       User.countDocuments({ role: 'vendor', createdBy:req.user.id, isApproved: false }),
//     ]);

//     res.status(200).json({
//       approved: approvedCount,
//       notApproved: notApprovedCount,
//       total: approvedCount + notApprovedCount,
//     });
//   } catch (err) {
//     console.error("Error fetching vendor stats:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

export const getMyVendorStats = async (req, res) => {
  try {
    const createdBy = req.user.id;

    // Get today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [approvedCount, notApprovedCount, todayCount] = await Promise.all([
      User.countDocuments({ role: 'vendor', createdBy, isApproved: true }),
      User.countDocuments({ role: 'vendor', createdBy, isApproved: false }),
      User.countDocuments({
        role: 'vendor',
        createdBy,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      }),
    ]);

    res.status(200).json({
      approved: approvedCount,
      notApproved: notApprovedCount,
      total: approvedCount + notApprovedCount,
      registeredToday: todayCount,
    });
  } catch (err) {
    console.error("Error fetching vendor stats:", err);
    res.status(500).json({ message: err.message });
  }
};



export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    // const updates = req.body;
    const { name, email, contact } = req.body;
    console.log("req.body :",req.body)

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    

user.name = name || user.name;
user.email = email || user.email;
user.contact = contact || user.contact;

    // Update basic fields
    // user.name = updates.name || user.name;
    // user.email = updates.email || user.email;
    // user.contact = updates.contact || user.contact;

    await user.save();

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalVendors = await User.countDocuments({ role: 'vendor' });

    // Users registered date-wise
    const usersByDate = await User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      totalUsers,
      totalAdmins,
      totalVendors,
      usersByDate
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error });
  }
};


export const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};
