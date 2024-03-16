const Color = require("../models/colorModel.js");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/ValidateMongoDbId.js");

//create product Color
const createColor = asyncHandler(async (req, res) => {
  try {
    const newCategory = await Color.create(req.body);
    res.json(newCategory);
  } catch (error) {
    throw new Error(error);
  }
});

//update product Color
const updateColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedColor = await Color.findByIdAndUpdate(id, req.body, {
      new: true,
    }); //return the new data
    res.json(updatedColor);
  } catch (error) {
    throw new Error(error);
  }
});

//delete Color
const deleteColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deletedColor = await Color.findByIdAndDelete(id); //return the new data
    res.json(deletedColor);
  } catch (error) {
    throw new Error(error);
  }
});

//get single Color
const getColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getColor = await Color.findById(id);
    res.json(getColor);
  } catch (error) {
    throw new Error(error);
  }
});

//get all categories
const getAllColors = asyncHandler(async (req, res) => {
  try {
    const getAllColor = await Color.find();
    res.json(getAllColor);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createColor,
  updateColor,
  deleteColor,
  getColor,
  getAllColors,
};
