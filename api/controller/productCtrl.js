const { default: slugify } = require("slugify");
const Product = require("../models/productModel.js");
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");

//Add new product
const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
  } catch (error) {
    throw new Error(error);
  }
});

// update product
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedProduct);
  } catch (error) {
    throw new Error(error);
  }
});

//Delete product
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deleteProduct = await Product.findByIdAndDelete(id);
    res.json({ message: "Product deleted successfully", deleteProduct });
  } catch (error) {
    throw new Error(error);
  }
});

//get single product
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const findProduct = await Product.findById(id);
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});

//get all products
const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const queryObj = { ...req.query };
    //! FILTERING PRODUCTS!

    // Define an array of fields to exclude from the query
    const excludeFields = ["page", "sort", "limit", "fields"];
    //! Remove excluded fields from the query object
    excludeFields.forEach((el) => delete queryObj[el]);
    //* Convert the query object to a JSON string
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let query = Product.find(JSON.parse(queryStr));

    //! SORTING

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    //! LIMITING THE FIELDS

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    //! PAGINATION

    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const totalPages = await Product.countDocuments();
      if (skip >= totalPages) {
        throw new Error("This page does not exists");
      }
    }

    //
    const products = await query;
    res.json(products);
  } catch (error) {
    throw new Error(error);
  }
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { productId } = req.body;
  try {
    const user = await User.findById(_id);
    const alreadyAdded = user.wishlist.find(
      (id) => id.toString() === productId
    );
    if (alreadyAdded) {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $pull: { wishlist: productId },
        },
        { new: true }
      );
      res.json(user);
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $push: { wishlist: productId },
        },
        { new: true }
      );
      res.json(user);
    }
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  addToWishlist,
};
