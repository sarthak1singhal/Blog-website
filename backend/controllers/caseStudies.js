const CaseStudies = require("../models/caseStudies");
const Category = require("../models/category");
const User = require("../models/user");
const formidable = require("formidable");
const slugify = require("slugify");
const stripHtml = require("string-strip-html");
const _ = require("lodash");
const { errorHandler } = require("../helpers/dbErrorHandler");
const fs = require("fs");
const { smartTrim } = require("../helpers/blog");

exports.create = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not upload",
      });
    }

    const { title, body, categories } = fields;

    if (!title || !title.length) {
      return res.status(400).json({
        error: "title is required",
      });
    }

    if (!body || body.length < 200) {
      return res.status(400).json({
        error: "Content is too short",
      });
    }

    if (!categories || categories.length === 0) {
      return res.status(400).json({
        error: "At least one category is required",
      });
    }

 
    let caseStudies = new CaseStudies();
    caseStudies.title = title;
    caseStudies.body = body;
    caseStudies.excerpt = smartTrim(body, 320, " ", " ...");
    caseStudies.slug = slugify(title).toLowerCase();
    caseStudies.mtitle = `${title} | ${process.env.APP_NAME}`;
    caseStudies.mdesc = stripHtml(body.substring(0, 160)).result;
    caseStudies.postedBy = req.user._id;
    // categories
    let arrayOfCategories = categories && categories.split(",");

    if (files.photo) {
      if (files.photo.size > 10000000) {
        return res.status(400).json({
          error: "Image should be less then 1mb in size",
        });
      }
      caseStudies.photo.data = fs.readFileSync(files.photo.path);
      caseStudies.photo.contentType = files.photo.type;
    }

    caseStudies.save((err, result) => {
      if (err) {
        // return console.log(err)
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      // res.json(result);
      CaseStudies.findByIdAndUpdate(
        result._id,
        { $push: { categories: arrayOfCategories } },
        { new: true }
      ).exec((err, result) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        } else {
          CaseStudies.findByIdAndUpdate(
            result._id,
            { new: true }
          ).exec((err, result) => {
            if (err) {
              return res.status(400).json({
                error: errorHandler(err),
              });
            } else {
              res.json(result);
            }
          });
        }
      });
    });
  });
};

// list, listAllBlogsCategoriesTags, read, remove, update

exports.list = (req, res) => {
  CaseStudies.find({})
    .populate("categories", "_id name slug")
    .populate("postedBy", "_id name username")
    .select(
      "_id title slug excerpt categories postedBy createdAt updatedAt"
    )
    .exec((err, data) => {
      if (err) {
        return res.json({
          error: errorHandler(err),
        });
      }
      res.json(data);
    });
};

exports.listAllBlogsCategoriesTags = (req, res) => {
  let limit = req.body.limit ? parseInt(req.body.limit) : 10;
  let skip = req.body.skip ? parseInt(req.body.skip) : 0;

  let blogs;
  let categories;

  CaseStudies.find({})
    .populate("categories", "_id name slug")
    .populate("postedBy", "_id name username profile")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select(
      "_id title slug excerpt categories postedBy createdAt updatedAt favoritesCount"
    )
    .exec((err, data) => {
      if (err) {
        return res.json({
          error: errorHandler(err),
        });
      }

      // Getting all blogs
      blogs = data;

      // Getting all categories
      Category.find({}).exec((err, c) => {
        if (err) {
          return res.json({
            error: errorHandler(err),
          });
        }

        categories = c;
          res.json({ blogs, categories,  size: blogs.length });
 
      });
    });
};

exports.read = (req, res) => {
  const slug = req.params.slug.toLowerCase();
  CaseStudies.findOne({ slug })
    // .select("-photo")
    .populate("categories", "_id name slug")
    .populate("postedBy", "_id name username")
    .select(
      "_id title body slug mtitle mdesc categories postedBy createdAt updatedAt favoritesCount"
    )
    .exec((err, data) => {
      if (err) {
        return res.json({
          error: errorHandler(err),
        });
      }
      res.json(data);
    });
};

exports.remove = (req, res) => {
  const slug = req.params.slug.toLowerCase();
  CaseStudies.findOneAndRemove({ slug }).exec((err, data) => {
    if (err) {
      return res.json({
        error: errorHandler(err),
      });
    }
    res.json({
      message: "CaseStudies deleted successfully",
    });
  });
};

exports.update = (req, res) => {
  const slug = req.params.slug.toLowerCase();

  CaseStudies.findOne({ slug }).exec((err, oldBlog) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }

    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(400).json({
          error: "Image could not upload",
        });
      }

      let slugBeforeMerge = oldBlog.slug;
      oldBlog = _.merge(oldBlog, fields);
      oldBlog.slug = slugBeforeMerge;

      const { body, desc, categories, } = fields;

      if (body) {
        oldBlog.excerpt = smartTrim(body, 320, " ", " ...");
        oldBlog.desc = stripHtml(body.substring(0, 160));
      }

      if (categories) {
        oldBlog.categories = categories.split(",");
      }

 

      if (files.photo) {
        if (files.photo.size > 10000000) {
          return res.status(400).json({
            error: "Image should be less then 1mb in size",
          });
        }
        oldBlog.photo.data = fs.readFileSync(files.photo.path);
        oldBlog.photo.contentType = files.photo.type;
      }

      oldBlog.save((err, result) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        }
        // result.photo = undefined;
        res.json(result);
      });
    });
  });
};

exports.photo = (req, res) => {
  const slug = req.params.slug.toLowerCase();
  CaseStudies.findOne({ slug })
    .select("photo")
    .exec((err, caseStudies) => {
      if (err || !caseStudies) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.set("Content-type", caseStudies.photo.contentType);
      return res.send(caseStudies.photo.data);
    });
};

exports.listRelated = (req, res) => {
  // console.log(req.body.caseStudies);
  let limit = req.body.limit ? parseInt(req.body.limit) : 3;
  const { _id, categories } = req.body.caseStudies;

  CaseStudies.find({ _id: { $ne: _id }, categories: { $in: categories } })
    .limit(limit)
    .populate("postedBy", "_id name username profile")
    .select("title slug excerpt postedBy createdAt updatedAt favoritesCount")
    .exec((err, blogs) => {
      if (err) {
        return res.status(400).json({
          error: "Blogs not found",
        });
      }
      res.json(blogs);
    });
};

// " i " says that the search is case insensitive
exports.listSearch = (req, res) => {
  console.log(req.query);
  const { search } = req.query;
  if (search) {
    CaseStudies.find(
      {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { body: { $regex: search, $options: "i" } },
        ],
      },
      (err, blogs) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        }
        res.json(blogs);
      }
    ).select("-photo -body");
  }
};

exports.listByUser = (req, res) => {
  User.findOne({ username: req.params.username }).exec((err, user) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    let userId = user._id;
    CaseStudies.find({ postedBy: userId })
      .populate("categories", "_id name slug")
      .populate("postedBy", "_id name username")
      .select("_id title slug postedBy createdAt updatedAt favoritesCount")
      .exec((err, data) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        }
        res.json(data);
      });
  });
};
