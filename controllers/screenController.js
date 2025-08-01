// controllers/screenController.js
import Shop from '../models/Shop.js';
import Screen from '../models/Screen.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';



// export const createScreen = async (req, res) => {
//   try {
//     const { name, email, contact, description } = req.body;

//     // Handle uploaded media from Cloudinary
//     const media = req.files.map((file) => ({
//       type: file.mimetype.startsWith('video') ? 'video' : 'image',
//       url: file.path,
//       public_id: file.filename, // Cloudinary URL
//     }));

//     // Create Screen document
//     const screen = await Screen.create({
//       name,
//       email,
//       contact,
//       description,
//       media,
//       createdBy: req.user.id,
//       creatorRole: req.user.role,
//     });

//     res.status(201).json(screen);
//   } catch (err) {
//     console.error('Screen creation error:', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };


// export const getScreensList = async (req, res) => {
//   try {
//     const screen = await Screen.find();
//     res.status(200).json(screen);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


export const getScreenById = async (req, res) => {
  try {
    const { id } = req.params;

    const screen = await Screen.findById(id);
    if (!screen) {
      return res.status(404).json({ message: 'Screen not found' });
    }

    res.status(200).json(screen);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// export const updateScreen = async (req, res) => {
//   try {
//     const screenId = req.params.id;
//     const updates = req.body;

//     const screen = await Screen.findById(screenId);
//     if (!screen) {
//       return res.status(404).json({ message: 'Screen not found' });
//     }

//     // Update basic fields
//     screen.name = updates.name || screen.name;
//     screen.email = updates.email || screen.email;
//     screen.contact = updates.contact || screen.contact;
//     screen.description = updates.description || screen.description;

//     // Parse and update existing media (after deletion)
//     if (updates.existingMedia) {
//       screen.media = JSON.parse(updates.existingMedia);
//     }

//     // Append new uploaded media
//     if (req.files && req.files.length > 0) {
//       const newMedia = req.files.map((file) => ({
//         url: `/uploads/${file.filename}`,
//         type: file.mimetype.startsWith('video') ? 'video' : 'image',
//       }));
//       screen.media.push(...newMedia);
//     }

//     await screen.save();

//     res.status(200).json({ message: 'Screen updated successfully', screen });
//   } catch (error) {
//     console.error('Error updating shop:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

export const updateScreen = async (req, res) => {
  try {
    const screenId = req.params.id;
    const updates = req.body;

    const screen = await Screen.findById(screenId);
    if (!screen) {
      return res.status(404).json({ message: 'Screen not found' });
    }

    // Update basic fields
    screen.name = updates.name || screen.name;
    screen.email = updates.email || screen.email;
    screen.contact = updates.contact || screen.contact;
    screen.description = updates.description || screen.description;

    // Update media if existingMedia is passed (used to preserve non-deleted items)
    if (updates.existingMedia) {
      try {
        screen.media = JSON.parse(updates.existingMedia); // Expecting [{ type, url }]
      } catch (parseErr) {
        return res.status(400).json({ message: 'Invalid format for existingMedia' });
      }
    }

    //  Add new uploaded media (Cloudinary URLs)
    if (req.files && req.files.length > 0) {
      const newMedia = req.files.map((file) => ({
        url: file.path, // Cloudinary URL
        type: file.mimetype.startsWith('video') ? 'video' : 'image',
      }));
      screen.media.push(...newMedia);
    }

    await screen.save();

    res.status(200).json({ message: 'Screen updated successfully', screen });
  } catch (error) {
    console.error('Error updating screen:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getScreenStats = async (req, res) => {
  try {
    const totalScreens = await Screen.countDocuments();

    // Group screens by created date
    const screensByDate = await Screen.aggregate([
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
      totalScreens,
      screensByDate
    });

  } catch (error) {
    console.error("Error fetching screens stats:", error);
    res.status(500).json({ message: "Error fetching screen stats", error });
  }
};


export const deleteMyScreen = async (req, res) => {
  try {
    await Screen.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Screen deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting screen', error });
  }
};

// export const getMyScreens = async (req, res) => {
//   let shopName = null;
//   try {
//     const shopId = req.user.id;
//     const shop = await Shop.findById(req.user.id);
//     if (shop) shopName = shop.name;

//     const screens = await Screen.find({ createdBy: shopId });
//     // res.status(200).json(screens);
//     res.status(200).json({ message: "My screens", screen: screens, shopName:shopName});
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to fetch screens' });
//   }
// };

export const getMyScreens = async (req, res) => {
  try {
    const shop = await Shop.findById(req.user.id).select("name");
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const screens = await Screen.find({ createdBy: req.user.id });

    res.status(200).json({
      message: "My screens",
      screen: screens,
      shopName: shop.name
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch screens" });
  }
};



// export const getScreens = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const role = req.user.role;

//     console.log("userId :",userId);
//     console.log("role :",role);

//     if (role === "admin") {
//       // Admin: get all screens
//       const screens = await Screen.find();
//       return res.status(200).json(screens);
//     }

//     if (role === "vendor") {
//       // Vendor: find all their shops
//       const shops = await Shop.find({ createdBy: userId }).select("_id");
//       const shopIds = shops.map(shop => shop._id);

//       // Find screens where createdBy in shopIds
//       const screens = await Screen.find({ createdBy: { $in: shopIds } }).populate("createdBy");
//       return res.status(200).json(screens);
//     }

//     return res.status(403).json({ message: "Unauthorized access" });
//   } catch (error) {
//     console.error("Error fetching screens:", error);
//     return res.status(500).json({ message: "Server Error" });
//   }
// };

export const getScreens = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    if (role === "admin") {
      const screens = await Screen.find()
        .populate({
          path: "createdBy",
          model: "Shop",
          select: "name"
        });
      return res.status(200).json(screens);
    }

    if (role === "vendor") {
      const shops = await Shop.find({ createdBy: userId }).select("_id");
      const shopIds = shops.map(shop => shop._id);

      // Find screens where createdBy in shopIds
      const screens = await Screen.find({ createdBy: { $in: shopIds } }).populate("createdBy");
      return res.status(200).json(screens);
    }

    return res.status(403).json({ message: "Unauthorized access" });
  } catch (error) {
    console.error("Error fetching screens:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};


export const getMyScreenStats = async (req, res) => {
  try {
    // const shopId = req.user.id;
    const shopId = new mongoose.Types.ObjectId(req.user.id);

    const totalScreens = await Screen.countDocuments({ createdBy: shopId });

    const screensByDate = await Screen.aggregate([
      {
        $match: {
          createdBy: shopId 
        }
      },
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
      totalScreens,
      screensByDate,
    });
    
  } catch (error) {
    console.error("Error fetching screen stats:", error);
    res.status(500).json({ message: "Error fetching screen stats", error });
  }
};

export const createScreen = async (req, res) => {
  try {
    const { name, email, contact, description, shopId } = req.body;

    if (!name | !contact) {
      return res.status(400).json({ message: "Name and Contact are required" });
    }

    const media = req.files?.map((file) => ({
      type: file.mimetype.startsWith("video") ? "video" : "image",
      url: file.path,
      public_id: file.filename,
    })) || [];

    let createdBy;
    
    if (req.user.role === "shop") {
      createdBy = req.user.id;
    } else {
      if (!shopId) {
        return res.status(400).json({ message: "Shop ID is required" });
      }
      createdBy = shopId;
    }

    const newScreen = new Screen({
      name,
      email,
      contact,
      description,
      media,
      createdBy,
      creatorRole: req.user.role,
    });

    await newScreen.save();

    res.status(201).json({ message: "Screen created", screen: newScreen });

  } catch (error) {
    res.status(500).json({ message: error.message || "Error creating screen" });
  }
};



    