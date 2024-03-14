const express = require("express");
const {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  addToWishlist,
} = require("../controller/productCtrl");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, isAdmin, createProduct);
router.get("/:id", getProduct);
router.put("/wishlist", authMiddleware, addToWishlist);
router.get("/", getAllProducts);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);
router.put("/:id", authMiddleware, isAdmin, updateProduct);

module.exports = router;
