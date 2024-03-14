const { generateToken } = require("../config/jwtToken.js");
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const validateMongoDbId = require("../utils/ValidateMongoDbId.js");
const { generateRefreshToken } = require("../config/refreshToken.js");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailCtrl.js");
const crypto = require("crypto");

const salt = bcrypt.genSaltSync(10);

//Create  a new user
const createUser = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, mobile, isAdmin } = req.body;
  const findUser = await User.findOne({ email });
  const hashedPassword = bcrypt.hashSync(password, salt);

  if (!findUser) {
    //create new user
    const newUser = await User.create({
      password: hashedPassword,
      email,
      firstName,
      isAdmin,
      lastName,
      mobile,
    });
    res.json(newUser);
  } else {
    //User already exist
    throw new Error("User Already Exists");
  }
});

//Login to the system
const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log(email + " " + password);

  // Check if user exists
  const userExist = await User.findOne({ email });
  if (userExist) {
    // Compare the input password with the hashed password from the database
    const passwordMatched = bcrypt.compareSync(password, userExist.password);

    if (passwordMatched) {
      const refreshToken = generateRefreshToken(userExist?._id);
      const updateUser = await User.findByIdAndUpdate(
        userExist._id,
        {
          refreshToken: refreshToken,
        },
        { new: true }
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      });
      res.json({
        _id: userExist._id,
        firstName: userExist.firstName,
        email: userExist.email,
        mobile: userExist.mobile,
        token: generateToken(userExist._id),
      });
    } else {
      throw new Error("Invalid Credentials");
    }
  } else {
    throw new Error("User not found");
  }
});

//handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No refresh token in cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error("No refresh token in db or not matched.");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(user.id);
    res.json({ accessToken });
  });
});

// get all users
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    throw new Error(err);
  }
});

//get single user
const getSingleUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getUser = await User.findById(id);
    res.json({ getUser });
  } catch (err) {
    throw new Error(err);
  }
});

//delete user
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteUser = await User.findByIdAndDelete(id);
    res.json({ message: `${deleteUser.firstName} Deleted Successfully ` });
  } catch (err) {
    throw new Error(err);
  }
});

//update user
const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        firstName: req.body?.firstName,
        lastName: req.body?.lastName,
        email: req.body?.email,
        mobile: req.body?.mobile,
      },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    throw new Error(err);
  }
});

//Log out user
const logoutUser = asyncHandler(async (req, res) => {
  //remove the token from the cookies
  const { refreshToken } = req.cookies;
  if (!refreshToken) throw new Error("No Refresh Token in Cookies");
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); //forbidden
  }
  await User.findOneAndUpdate(
    { refreshToken: refreshToken },
    { refreshToken: "" }
  );
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); //forbidden
});

//block user (Admin)
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const block = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      { new: true }
    );
    res.json({
      message: "User Blocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

//unblock user (Admin)
const unBlockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      { new: true }
    );
    res.json({
      message: "User Unblocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found with this address email" + email);
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetUrl = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:4000/api/user/reset-password/${token}'>Click Here</a>`;
    const data = {
      to: email,
      text: "Hey User",
      subject: "Forgot Password Link",
      htm: resetUrl,
    };
    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Invalid Token or Expired Token");
  }

  // Hash the new password
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  // Update user details
  user.password = hashedPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  res.json(user);
});

module.exports = {
  createUser,
  loginUserCtrl,
  getAllUsers,
  getSingleUser,
  deleteUser,
  updateUser,
  blockUser,
  unBlockUser,
  handleRefreshToken,
  logoutUser,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
};
