// controllers/combopController.js
import ComboProduct from '../models/ComboProduct.js';
import Product from '../models/Product.js';


// Create a new combodeal
export const addComboDeal = async (req, res) => {
try {
const {
comboProductIds,
price,
offerprice,
offerPercentage,
startDate,
endDate,
desc
} = req.body;

const parsedComboIds = JSON.parse(comboProductIds);

// Check stock and existence
const validProducts = await Product.find({ _id: { $in: parsedComboIds } });

if (validProducts.length !== parsedComboIds.length) {
  return res.status(404).json({ message: "One or more selected products not found." });
}

const outOfStock = validProducts.filter(p => p.stock <= 0);
if (outOfStock.length > 0) {
  return res.status(400).json({
    message: "Some products are out of stock.",
    products: outOfStock.map(p => ({ id: p._id, name: p.name, stock: p.stock }))
  });
}

const media = req.files?.map(file => ({
  type: file.mimetype.startsWith("video") ? "video" : "image",
  url: file.path,
  public_id: file.filename,
})) || [];

const comboDeal = new ComboProduct({
  comboProducts: parsedComboIds,
  price,
  offerprice,
  offerPercentage,
  startDate,
  endDate,
  desc,
  media,
});

await comboDeal.save();

res.status(201).json({ message: "Combo deal created successfully!", comboDeal:comboDeal });
} catch (err) {
console.error(err);
res.status(500).json({ message: err.message || "Failed to create combo deal." });
}
};


// Get all combodeals
export const getComboDeals = async (req, res) => {
  try {
  const comboDeals = await ComboProduct.find().populate("comboProducts");
  res.status(201).json({ message: 'Deal Fetched successfully',comboDeals:comboDeals });
  } catch (err) {
  res.status(500).json({ message: err.message });
  }
};

// Get combodeal by ID
export const getComboDealById = async (req, res) => {
  try {
  const comboDeal = await ComboProduct.findById(req.params.id).populate("comboProducts");
  if (!comboDeal) return res.status(404).json({ message: "Combo Deal not found" });
  res.status(201).json({ message: 'Combo Deal Fetched successfully',comboDeal:comboDeal });
  } catch (err) {
  res.status(500).json({ message: err.message });
  }
};

// Update combodeal
export const updateComboDeal = async (req, res) => {
  try {
    const comboId = req.params.id;
    const updates = req.body;

    const comboDeal = await ComboProduct.findById(comboId);
    if (!comboDeal) {
      return res.status(404).json({ message: "Combo Deal not found" });
    }

    // Update fields
    if (updates.comboProductIds) {
  try {
    const parsedIds = typeof updates.comboProductIds === 'string'
      ? JSON.parse(updates.comboProductIds)
      : updates.comboProductIds;

    comboDeal.comboProducts = parsedIds;
  } catch (err) {
    return res.status(400).json({ message: "Invalid comboProductIds format" });
  }
}

    comboDeal.price = updates.price || comboDeal.price;
    comboDeal.dealOfferprice = updates.dealOfferprice || comboDeal.dealOfferprice;
    comboDeal.dealPercentage = updates.dealPercentage || comboDeal.dealPercentage;
    comboDeal.desc = updates.desc || comboDeal.desc;
    comboDeal.startDate = updates.startDate || comboDeal.startDate;
    comboDeal.endDate = updates.endDate || comboDeal.endDate;

    if (updates.endDate) {
      comboDeal.expiresAt = updates.endDate;
    }

    // Media - handle existing
    if (updates.existingMedia) {
      try {
        const parsed = typeof updates.existingMedia === "string"
          ? JSON.parse(updates.existingMedia)
          : updates.existingMedia;
        comboDeal.media = parsed;
      } catch (err) {
        return res.status(400).json({ message: "Invalid existingMedia format" });
      }
    }

    // New uploaded media
    if (req.files && req.files.length > 0) {
      const newMedia = req.files.map(file => ({
        url: file.path,
        type: file.mimetype.startsWith("video") ? "video" : "image",
        public_id: file.filename,
      }));
      comboDeal.media.push(...newMedia);
    }

    await comboDeal.save();
    res.json({ message: "Combo Deal updated successfully", comboDeal: comboDeal });

  } catch (err) {
    console.error("Update combo deal error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};


// Delete combodeal
export const deleteDeal = async (req, res) => {
  try {
    await ComboProduct.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Combo Deal deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting combo deal', error });
  }
};
