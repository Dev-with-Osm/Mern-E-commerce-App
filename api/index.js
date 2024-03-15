const express = require("express");
const dbConnect = require("./config/dbConnect");
const dotenv = require("dotenv").config();
const authRouter = require("./routes/authRoute.js");
const productRouter = require("./routes/productRoute.js");
const blogRouter = require("./routes/blogRoute.js");
const couponRouter = require("./routes/couponRoute.js");
const categoryRouter = require("./routes/prodCategoryRoute.js");
const blogCategoryRouter = require("./routes/blogCategoryRoute.js");
const brandRouter = require("./routes/brandRoute.js");
const cookieParser = require("cookie-parser");
const { notFound, errorHandler } = require("./middlewares/errorHandler.js");
const morgan = require("morgan");
const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
const port = process.env.PORT || 4000;

dbConnect();

app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/blog", blogRouter);
app.use("/api/category", categoryRouter);
app.use("/api/blogcategory", blogCategoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/coupon", couponRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log("server is running on " + port);
});
