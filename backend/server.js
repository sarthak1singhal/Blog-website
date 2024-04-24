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
const fundingTagRoutes = require("./routes/funding-tags");
const formRoutes = require("./routes/form");
const startRaisingRoutes = require("./routes/startRaising");
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
var whitelist = ['http://localhost:3000', 'https://www.ventureup.in']; //white list consumers
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true, //Credentials are cookies, authorization headers or TLS client certificates.
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'device-remember-token', 'Access-Control-Allow-Origin', 'Origin', 'Accept']
};

app.use(cors(corsOptions)); 


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
app.use("/api", fundingTagRoutes);
app.use("/api", formRoutes);
app.use("/api", startRaisingRoutes);

// Port
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on PORT: ${port}`);
});
