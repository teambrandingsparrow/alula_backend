// controllers/dealController.js
import DealProduct from '../models/DealProduct.js';
import Product from '../models/Product.js';


// Create a new deal
export const addDeal = async (req, res) => {
try {
const {productId,dealOfferprice,dealPercentage,startDate,endDate} = req.body;

const product = await Product.findById(productId);
if (!product) return res.status(404).json({ message: "Product not found" });

const existing = await DealProduct.findOne({ product: productId });
if (existing) return res.status(400).json({ message: "Deal already exists for this product" });

const media = req.files?.map(file => ({
  type: file.mimetype.startsWith("video") ? "video" : "image",
  url: file.path,
  public_id: file.filename,
})) || [];

const deal = new DealProduct({
  product: product._id,
  dealOfferprice,
  dealPercentage,
  startDate,
  endDate,
  expiresAt: endDate,
  media,
});

await deal.save();
res.status(201).json({ message: "Deal added successfully", deal:deal });
} catch (err) {
console.error(err);
res.status(500).json({ message: err.message || "Something went wrong" });
}
};


// Get all deals
export const getDeals = async (req, res) => {
  try {
  const deals = await DealProduct.find().populate("product");
  res.status(201).json({ message: 'Deal Fetched successfully',deals:deals });
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