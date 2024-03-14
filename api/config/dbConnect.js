const { default: mongoose } = require("mongoose");

const dbConnect = async () => {
  try {
    // Disable SSL certificate verification (for development purposes)
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB connected...");
  } catch (err) {
    console.error(err);
  }
};

module.exports = dbConnect;
