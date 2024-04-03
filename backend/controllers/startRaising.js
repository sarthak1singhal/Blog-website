const RaiseFundingBlog = require("../models/raiseFunding");
const Category = require("../models/category");
const Tag = require("../models/tag");
const User = require("../models/user");
const formidable = require("formidable");
const slugify = require("slugify");
const stripHtml = require("string-strip-html");
const _ = require("lodash");
const { errorHandler } = require("../helpers/dbErrorHandler");
const fs = require("fs");
const { smartTrim } = require("../helpers/blog");
// const blog = require("../models/blog");
const { populate } = require("../models/blog");
const fundingTags = require("../models/funding-tags");
const FormDataModel = require("../models/formData");

exports.create = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "File could not upload",
      });
    }
    
    const { title, body, tags, fileUrl, imageUrl, logoUrl, mdesc } = fields;
    console.log(title, imageUrl, fileUrl, mdesc, logoUrl)

    if (!title || !title.length) {
      return res.status(400).json({
        error: "title is required",
      });
    }
    if (!fileUrl || !fileUrl.length) {
      return res.status(400).json({
        error: "fileUrl is required",
      });
    }    
    // if (!logoUrl || !logoUrl.length) {
    //   return res.status(400).json({
    //     error: "logoUrl is required",
    //   });
    // }
    if (!body || body.length < 200) {
      return res.status(400).json({
        error: "Content is too short",
      });
    }

 

    if (!tags || tags.length === 0) {
      return res.status(400).json({
        error: "At least one tag is required",
      });
    }

    let blog = new RaiseFundingBlog();
    blog.title = title;
    blog.body = body;

    blog.excerpt = smartTrim(body, 320, " ", " ...");
    blog.slug = slugify(title).toLowerCase();
    blog.mtitle = `${title}`;
    blog.mdesc = mdesc
    // stripHtml(body.substring(0, 160)).result;
    blog.postedBy = req.user._id;
    blog.fileUrl = fileUrl
    blog.imageUrl = imageUrl
    // categories and tags
    // let arrayOfCategories = categories && categories.split(",");
    let arrayOfTags = tags && tags.split(",");

  

    blog.save((err, result) => {
      if (err) {
        // return console.log(err)
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      // res.json(result);
      RaiseFundingBlog.findByIdAndUpdate(
        result._id,
        { $push: { tags: arrayOfTags } },
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
    });
  });
};

// list, listAllBlogsCategoriesTags, read, remove, update

exports.list = (req, res) => {
  let limit = req.body.limit ? parseInt(req.body.limit) : 10;
  let skip = req.body.skip ? parseInt(req.body.skip) : 0;
  let {tag} = req.body
  console.log(tag)
  let query = {}
  if(tag){

    fundingTags.findOne({ name: tag }).select('_id').exec((err, tagg) => {
      if (err) {
        // Handle error
        console.error(err);
        return res.json({
          error: errorHandler(err),
        });
      }
      if (tagg) {
        const tagId = tagg._id;
        query = { tags: { $elemMatch: { $eq: `${tagId}`}} };

        RaiseFundingBlog.find(query)
          .populate("postedBy", "_id name username")
          .select(
            "_id title slug excerpt tags postedBy fileUrl createdAt updatedAt mdesc"
          )
          .exec((err, data) => {
            if (err) {
              return res.json({
                error: errorHandler(err),
              });
            }
            res.json(data);
          });
        } else {
          // Tag not found
          console.log('Tag not found');
          RaiseFundingBlog.find(query)
            .populate("postedBy", "_id name username")
            .select(
              "_id title slug"
            )
            .exec((err, data) => {
              if (err) {
                return res.json({
                  error: errorHandler(err),
                });
              }
              res.json(data);
            });
      }
    });
  }
};

exports.listAllBlogsCategoriesTags = (req, res) => {
  let limit = req.body.limit ? parseInt(req.body.limit) : 10;
  let skip = req.body.skip ? parseInt(req.body.skip) : 0;

  let blogs;
  let tags;

  RaiseFundingBlog.find({})
    .populate("tags", "_id name slug")
    .populate("postedBy", "_id name username profile")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select(
      "_id title slug excerpt tags postedBy createdAt fileUrl updatedAt favoritesCount"
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
      fundingTags.find({}).exec((err, t) => {
        if (err) {
          return res.json({
            error: errorHandler(err),
          });
        }
        tags = t;

        // Return all blogs and tags
        res.json({ blogs, tags, size: blogs.length });
      });
    });
};

exports.read = (req, res) => {
  const slug = req.params.slug.toLowerCase();
  RaiseFundingBlog.findOne({ slug })
    // .select("-photo")
    // .populate("categories", "_id name slug")
    .populate("tags", "_id name slug")
    .populate("postedBy", "_id name username")
    .select(
      "_id title body slug mtitle imageUrl mdesc tags postedBy fileUrl createdAt updatedAt favoritesCount"
    )
    .exec((err, data) => {
      console.log("meow",data)
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
  RaiseFundingBlog.findOneAndRemove({ slug }).exec((err, data) => {
    if (err) {
      return res.json({
        error: errorHandler(err),
      });
    }
    res.json({
      message: "RaiseFundingBlog deleted successfully",
    });
  });
};

exports.update = (req, res) => {
  const slug = req.params.slug.toLowerCase();

  RaiseFundingBlog.findOne({ slug }).exec((err, oldBlog) => {
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

      const { body, desc, tags } = fields;

      if (body) {
        oldBlog.excerpt = smartTrim(body, 320, " ", " ...");
        oldBlog.desc = stripHtml(body.substring(0, 160));
      }

     

      if (tags) {
        oldBlog.tags = tags.split(",");
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

// exports.photo = (req, res) => {
//   const slug = req.params.slug.toLowerCase();
//   RaiseFundingBlog.findOne({ slug })
//     .select("photo")
//     .exec((err, blog) => {
//       if (err || !blog) {
//         return res.status(400).json({
//           error: errorHandler(err),
//         });
//       }
//       res.set("Content-type", blog.photo.contentType);
//       return res.send(blog.photo.data);
//     });
// };

exports.listRelated = (req, res) => {
  // console.log(req.body.blog);
  let limit = req.body.limit ? parseInt(req.body.limit) : 3;
  const { _id, tags } = req.body.blog;

  RaiseFundingBlog.find({ _id: { $ne: _id }, tags: { $in: tags } })
    .limit(limit)
    .populate("postedBy", "_id name username profile")
    .select("title slug excerpt postedBy createdAt fileUrl updatedAt favoritesCount")
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
    RaiseFundingBlog.find(
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
    RaiseFundingBlog.find({ postedBy: userId })
      .populate("tags", "_id name slug")
      .populate("postedBy", "_id name username")
      .select("_id title slug postedBy createdAt fileUrl updatedAt favoritesCount")
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




exports.createUserFormData = (req, res) => {
  const { name, company, phone, types } = req.body;

  // Create a new instance of your Mongoose model
  const formdata = new FormDataModel({
      name,
      company,
      phone,
      types,
  });

  // Save the data to the database
  formdata.save((err, result) => {
      if (err) {
          // Return error response if there's an error
          return res.status(400).json({
              error: errorHandler(err),
          });
      } else {
          // Return success response if data is saved successfully
          return res.status(200).json({
              message: "Data saved successfully",
              data: result
          });
      }
  });
};