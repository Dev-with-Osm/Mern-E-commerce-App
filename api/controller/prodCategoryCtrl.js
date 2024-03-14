const Category = require("../models/prodCategoryModel.js");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/ValidateMongoDbId.js");

//create product category
const createCategory = asyncHandler(async (req, res) => {
  try {
    const newCategory = await Category.create(req.body);
    res.json(newCategory);
  } catch (error) {
    throw new Error(error);
  }
});

//update product category
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
    }); //return the new data
    res.json(updatedCategory);
  } catch (error) {
    throw new Error(error);
  }
});

//delete category
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deletedCategory = await Category.findByIdAndDelete(id); //return the new data
    res.json(deletedCategory);
  } catch (error) {
    throw new Error(error);
  }
});

//get single category
const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getCategory = await Category.findById(id);
    res.json(getCategory);
  } catch (error) {
    throw new Error(error);
  }
});

//get all categories
const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const getAllCategories = await Category.find();
    res.json(getAllCategories);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategories,
};
