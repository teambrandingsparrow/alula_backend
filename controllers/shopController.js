// controllers/shopController.js
import User from '../models/User.js';
import Shop from '../models/Shop.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

//   try {
//     const { name, email, address, contact, owner, description } = req.body;

//     const media = req.files.map((file) => ({
//       type: file.mimetype.startsWith('video') ? 'video' : 'image',
//       url: `/uploads/${file.filename}`,
//     }));

//     const shop = await Shop.create({
//       name,
//       email,
//       address,
//       contact,
//       owner,
//       description,
//       createdBy: req.user.id,
//       creatorRole: req.user.role,
//       media,
//     });

//     res.status(201).json(shop);
//   } catch (err) {
//     console.error('Shop creation error:', err);
//     res.status(500).json({ message: err.message });
//   }
// };

////////////////////////////////////////////////////////////////

// export const registerShop = async (req, res) => {
//   try {
//     const { name, email, password, address, contact, owner, description } = req.body;

//     const media = req.files.map((file) => ({
//       type: file.mimetype.startsWith('video') ? 'video' : 'image',
//       url: `/uploads/${file.filename}`,
//     }));

//     const existing = await Shop.findOne({ email });
//     if (existing) return res.status(400).json({ message: 'Shop email already exists' });

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const shop = await Shop.create({
//       name,
//       email,
//       password: hashedPassword,
//       address,
//       contact,
//       owner,
//       description,
//       createdBy: req.user.id,
//       creatorRole: req.user.role,
//       role: 'shop',
//       media,
//     });

//     res.status(201).json({ message: 'Shop registered successfully', shop });
//   } catch (error) {
//     console.error('Shop registration error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

////////////////////////////////////////////////////////

// export const registerShop = async (req, res) => {
//   try {
//     console.log("req.files:", req.files);

//     const { name, email, password, address, contact, owner, description } = req.body;
//     console.log("req.body",req.body)

//     const media = req.files.map((file) => ({
//       type: file.mimetype.startsWith('video') ? 'video' : 'image',
//       url: file.path, // Cloudinary URL
//     }));

//     console.log("media",media)
//     const existing = await Shop.findOne({ email });
//     if (existing) return res.status(400).json({ message: 'Shop email already exists' });

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const shop = await Shop.create({
//       name,
//       email,
//       password: hashedPassword,
//       address,
//       contact,
//       owner,
//       description,
//       createdBy: req.user.id,
//       creatorRole: req.user.role,
//       role: 'shop',
//       media,
//     });

//     res.status(201).json({ message: 'Shop registered successfully', shop });
//   } catch (err) {
//     console.error('Shop registration error:', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

export const registerShop = async (req, res) => {
  try {
    console.log("req.files:", req.files);
    console.log("req.body:", req.body);

    const { name, email, password, address, contact, owner, description } = req.body;
    
    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists...!' });
    }

    const existingShop = await Shop.findOne({ email: normalizedEmail });
    if (existingShop) {
      return res.status(400).json({ message: 'Email already exists...!' });
    }

    const media = req.files?.map((file) => ({
      type: file.mimetype.startsWith('video') ? 'video' : 'image',
      url: file.path, // Cloudinary URL
      public_id: file.filename, // Save this if you want to support deletion later
    })) || [];

    const hashedPassword = await bcrypt.hash(password, 10);

    const shop = await Shop.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      address,
      contact,
      owner,
      description,
      createdBy: req.user.id,
      creatorRole: req.user.role,
      role: 'shop',
      media,
    });

    res.status(201).json({ message: 'Shop registered successfully', shop });
  } catch (err) {
    console.error('Shop registration error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const loginShop = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('req.body :', req.body);

    const shop = await Shop.findOne({ email });
    console.log('shop :', shop);
    
    if (!shop) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, shop.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: shop._id, role: 'shop' }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ message: 'Login successful', token, shop });
  } catch (error) {
    console.error('Shop login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; 

    if (!token) {
      return res.status(401).json({ valid: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const shop = await Shop.findById(decoded.id);
    if (!shop) {
      return res.status(401).json({ valid: false, message: "Shop not found" });
    }

    res.status(200).json({
      valid: true,
      user: {
        id: shop._id,
        role: shop.role,
        email: shop.email,
      },
    });
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ valid: false, message: "Invalid token" });
  }
};

export const updateShop = async (req, res) => {
  try {
    const shopId = req.params.id;
    const updates = req.body;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    // Update basic fields
    shop.name = updates.name || shop.name;
    shop.email = updates.email || shop.email;
    shop.address = updates.address || shop.address;
    shop.contact = updates.contact || shop.contact;
    shop.description = updates.description || shop.description;
    shop.owner = updates.owner || shop.owner;

    // Replace with existing media (after deletions)
    if (updates.existingMedia) {
      try {
        shop.media = JSON.parse(updates.existingMedia);
      } catch (err) {
        return res.status(400).json({ message: 'Invalid existingMedia format' });
      }
    }

    // Add new Cloudinary media
    if (req.files && req.files.length > 0) {
      const newMedia = req.files.map((file) => ({
        url: file.path, // Cloudinary provides file.path as the URL
        type: file.mimetype.startsWith('video') ? 'video' : 'image',
      }));
      shop.media.push(...newMedia);
    }

    await shop.save();

    res.status(200).json({ message: 'Shop updated successfully', shop });
  } catch (error) {
    console.error('Error updating shop:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



export const getShopsList = async (req, res) => {
  try {
    const shops = await Shop.find(); // fetch all shops
    res.status(200).json(shops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyShops = async (req, res) => {
  try {
    const userId = req.user.id;
    const shops = await Shop.find({ createdBy: userId });
    res.status(200).json(shops);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch shops' });
  }
};

export const getShopById = async (req, res) => {
  try {
    const { id } = req.params;

    const shop = await Shop.findById(id);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    res.status(200).json(shop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteMyShop = async (req, res) => {
  try {
    await Shop.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Shop deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting shop', error });
  }
};



// export const updateShop = async (req, res) => {
//   try {
//     const shopId = req.params.id;
//     const updates = req.body;

//     const shop = await Shop.findById(shopId);
//     if (!shop) {
//       return res.status(404).json({ message: 'Shop not found' });
//     }

//     // Update basic fields
//     shop.name = updates.name || shop.name;
//     shop.email = updates.email || shop.email;
//     shop.address = updates.address || shop.address;
//     shop.contact = updates.contact || shop.contact;
//     shop.description = updates.description || shop.description;
//     shop.owner = updates.owner || shop.owner;

//     // Parse and update existing media (after deletion)
//     if (updates.existingMedia) {
//       shop.media = JSON.parse(updates.existingMedia);
//     }

//     // Append new uploaded media
//     if (req.files && req.files.length > 0) {
//       const newMedia = req.files.map((file) => ({
//         url: `/uploads/${file.filename}`,
//         type: file.mimetype.startsWith('video') ? 'video' : 'image',
//       }));
//       shop.media.push(...newMedia);
//     }

//     await shop.save();

//     res.status(200).json({ message: 'Shop updated successfully', shop });
//   } catch (error) {
//     console.error('Error updating shop:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

export const getShopStats = async (req, res) => {
  try {
    const totalShops = await Shop.countDocuments();
    const shopsByAdmins = await Shop.countDocuments({ creatorRole: 'admin' });
    const shopsByVendors = await Shop.countDocuments({ creatorRole: 'vendor' });

    // Group shops by created date
    const shopsByDate = await Shop.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      totalShops,
      shopsByAdmins,
      shopsByVendors,
      shopsByDate
    });

  } catch (error) {
    console.error("Error fetching shop stats:", error);
    res.status(500).json({ message: "Error fetching shop stats", error });
  }
};

export const getMyShopStats = async (req, res) => {
  try {
    const createdBy = req.user.id;

    // Get today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [totalCount,todayCount] = await Promise.all([
      Shop.countDocuments({ createdBy }),
      Shop.countDocuments({
        createdBy,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      }),
    ]);

    res.status(200).json({
     totalCount,
      todayCount
    });
  } catch (err) {
    console.error("Error fetching shop stats:", err);
    res.status(500).json({ message: err.message });
  }
};

