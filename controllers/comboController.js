// controllers/combopController.js
import ComboProduct from '../models/ComboProduct.js';
import Product from '../models/Product.js';


// Create a new deal
export const addDeal = async (req, res) => {
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


// Get all deals
export const getDeals = async (req, res) => {
  try {
  const comboDeals = await ComboProduct.find().populate("comboProducts");
  res.status(201).json({ message: 'Deal Fetched successfully',comboDeals:comboDeals });
  } catch (err) {
  res.status(500).json({ message: err.message });
  }
};

// Get deal by ID
export const getDealById = async (req, res) => {
  try {
  const deal = await DealProduct.findById(req.params.id).populate("product");
  if (!deal) return res.status(404).json({ message: "Deal not found" });
  res.status(201).json({ message: 'Deal Fetched successfully',deal:deal });
  } catch (err) {
  res.status(500).json({ message: err.message });
  }
};

// Update deal
export const updateDeal = async (req, res) => {
try {
const dealId = req.params.id;
    const updates = req.body;
    console.log("updates ",updates)

const deal = await DealProduct.findById(dealId);
if (!deal) return res.status(404).json({ message: "Deal not found" });

    deal.dealOfferprice = updates.dealOfferprice || deal.dealOfferprice;
    deal.dealPercentage = updates.dealPercentage || deal.dealPercentage;
    deal.startDate = updates.startDate || deal.startDate;
    deal.endDate = updates.endDate || deal.endDate;
    if(deal.endDate){
      deal.expiresAt = updates.endDate || deal.expiresAt;
    }
    

// Handle media updates
 if (updates.existingMedia) {
      try {
        const parsed = typeof updates.existingMedia === "string"
          ? JSON.parse(updates.existingMedia)
          : updates.existingMedia;
        deal.media = parsed;
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
      deal.media.push(...newMedia);
    }

await deal.save();
res.json({ message: "Deal updated successfully", deal });
} catch (err) {
console.error("Update deal error:", err);
res.status(500).json({ message: err.message || "Server error" });
}
};

// Delete deal
export const deleteDeal = async (req, res) => {
  try {
    await DealProduct.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Deal deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting deal', error });
  }
};