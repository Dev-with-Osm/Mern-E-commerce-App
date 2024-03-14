const Brand = require("../models/brandModel.js");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/ValidateMongoDbId.js");

//create product Brand
const createBrand = asyncHandler(async (req, res) => {
  try {
    const newCategory = await Brand.create(req.body);
    res.json(newCategory);
  } catch (error) {
    throw new Error(error);
  }
});

//update product Brand
const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedBrand = await Brand.findByIdAndUpdate(id, req.body, {
      new: true,
    }); //return the new data
    res.json(updatedBrand);
  } catch (error) {
    throw new Error(error);
  }
});

//delete Brand
const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deletedBrand = await Brand.findByIdAndDelete(id); //return the new data
    res.json(deletedBrand);
  } catch (error) {
    throw new Error(error);
  }
});

//get single Brand
const getBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getBrand = await Brand.findById(id);
    res.json(getBrand);
  } catch (error) {
    throw new Error(error);
  }
});

//get all categories
const getAllBrands = asyncHandler(async (req, res) => {
  try {
    const getAllBrand = await Brand.find();
    res.json(getAllBrand);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  getAllBrands,
};
