// controllers/categoryController.js
import Product from '../models/Product.js';
import Category from '../models/Category.js';


export const addProduct = async (req, res) => {
  try {
    console.log("req.body :",req.body)
    const { name,
    desc,
    price,
    offerprice,
    percentage,
    size,
    category,
    color,
    stock ,
    variant,
} = req.body;
    console.log("req.body :",req.body)

    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    // Handle uploaded media from Cloudinary
    const media = req.files.map((file) => ({
      type: file.mimetype.startsWith('video') ? 'video' : 'image',
      url: file.path,
      public_id: file.filename, 
    }));

    // Create product document
    const product = await Product.create({
        name,
        desc,
        price,
        offerprice,
        percentage,
        size,
        category: {
        _id: categoryDoc._id,
        name: categoryDoc.name,
      },
        color,
        stock ,
        media,
        variant,
    });

    res.status(201).json({message:"Product created successfully",product:product});
  } catch (err) {
    console.error('Product creation error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getProductList = async (req, res) => {
  try {
    const product = await Product.find();
    res.status(200).json({message:"Product fetch successful",product:product});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updates = req.body;
    console.log("updates ",updates)

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If category ID is sent, fetch name from DB
    if (updates.categoryId) {
      const newCategory = await Category.findById(updates.categoryId);
      if (!newCategory) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }

      product.category = {
        _id: newCategory._id,
        name: newCategory.name
      };
    }

    // Update basic fields
    product.name = updates.name || product.name;
    product.desc = updates.desc || product.desc;
    product.price = updates.price || product.price;
    product.offerprice = updates.offerprice || product.offerprice;
    product.percentage = updates.percentage || product.percentage;
    product.size = updates.size || product.size;
    product.color = updates.color || product.color;
    product.stock = updates.stock || product.stock;
    product.variant = updates.variant || product.variant;

    // Parse and update existing media
    if (updates.existingMedia) {
      try {
        const parsed = typeof updates.existingMedia === "string"
          ? JSON.parse(updates.existingMedia)
          : updates.existingMedia;
        product.media = parsed;
      } catch (err) {
        return res.status(400).json({ message: "Invalid existingMedia format" });
      }
    }

    // Add new uploaded media (Cloudinary URLs)
    if (req.files && req.files.length > 0) {
      const newMedia = req.files.map((file) => ({
        url: file.path,
        type: file.mimetype.startsWith("video") ? "video" : "image",
        public_id: file.filename,
      }));
      product.media.push(...newMedia);
    }

    await product.save();

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("Error updating Product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json({ message: 'Product found',product:product});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
};
