const express = require("express");
const {
  create,
  list,
  listAllBlogsCategoriesTags,
  read,
  remove,
  update,
  // photo,
  listRelated,
  listSearch,
  listByUser,
} = require("../controllers/blog");
const {
  requireSignin,
  adminMiddleWare,
  authMiddleWare,
  canUpdateDeleteBlog,
} = require("../controllers/auth");
const router = express.Router();

// For admin user
router.post("/blog", requireSignin, adminMiddleWare, create);
router.post("/blogs-categories-tags", listAllBlogsCategoriesTags);
router.delete("/blog/:slug", requireSignin, adminMiddleWare, remove);
router.put("/blog/:slug", requireSignin, adminMiddleWare, update);


router.get("/blogs", list);
// router.get("/blog/photo/:slug", photo);
router.post("/blogs/related", listRelated);
router.get("/blogs/search", listSearch);
router.get("/blog/:slug", read);



// For normal user
router.post("/user/blog", requireSignin, authMiddleWare, create);
router.get("/:username/blogs", listByUser);
router.delete(
  "/user/blog/:slug",
  requireSignin,
  authMiddleWare,
  canUpdateDeleteBlog,
  remove
);
router.put(
  "/user/blog/:slug",
  requireSignin,
  authMiddleWare,
  canUpdateDeleteBlog,
  update
);

module.exports = router;
