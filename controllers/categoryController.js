// controllers/categoryController.js
import Category from '../models/Category.js';
import mongoose from 'mongoose';

export const addCategory = async (req, res) => {
  try {
    console.log("req.body :",req.body)
    const { name, desc, type,} = req.body;
    console.log("req.body :",req.body)

    // Handle uploaded media from Cloudinary
    const media = req.files.map((file) => ({
      type: file.mimetype.startsWith('video') ? 'video' : 'image',
      url: file.path,
      public_id: file.filename, 
    }));

    // Create category document
    const category = await Category.create({
      name,
      desc,
      type,
      media,
    });

    res.status(201).json({message:"Category created successfully",category:category});
  } catch (err) {
    console.error('Category creation error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getCategoryList = async (req, res) => {
  try {
    const category = await Category.find();
    res.status(200).json({message:"Category fetch successful",category:category});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const updates = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update basic fields
    category.name = updates.name || category.name;
    category.desc = updates.desc || category.desc;
    category.type = updates.type || category.type;

    // Update media if existingMedia is passed (used to preserve non-deleted items)
    if (updates.existingMedia) {
      try {
        category.media = JSON.parse(updates.existingMedia); // Expecting [{ type, url }]
      } catch (parseErr) {
        return res.status(400).json({ message: 'Invalid format for existingMedia' });
      }
    }

    //  Add new uploaded media (Cloudinary URLs)
    if (req.files && req.files.length > 0) {
      const newMedia = req.files.map((file) => ({
        url: file.path,
        type: file.mimetype.startsWith('video') ? 'video' : 'image',
        public_id: file.filename,
      }));
      category.media.push(...newMedia);
    }

    await category.save();

    res.status(200).json({ message: 'Category updated successfully', category:category });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.status(200).json({ message: 'Category found',category:category});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error });
  }
};
