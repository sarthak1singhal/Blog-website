const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const blogRoutes = require("./routes/blog");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const tagRoutes = require("./routes/tag");
const formRoutes = require("./routes/form");
const portfolioRoutes = require("./routes/caseStudies");

// App
const app = express();

// DB
mongoose
  .connect(process.env.DATABASE_CLOUD, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connected"));

// Middlewares
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cookieParser());
// Cors
const whitelist = [/http:\/\/localhost:[0-9]{4}/]
const corsOptions = {
    origin: function(origin, callback) {
      console.log(origin)
        if (whitelist.some((el) => origin.match(el)) || origin === undefined) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
}
app.use(cors(corsOptions))
app.use('/api/health-check', (req, res) => {
  return res.status(200).json({ success: true, message: '', data: null })
})

// Routes MiddleWare
app.use("/api", blogRoutes);
app.use("/api", portfolioRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", tagRoutes);
app.use("/api", formRoutes);

// Port
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on PORT: ${port}`);
});
