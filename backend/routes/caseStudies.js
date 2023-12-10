const express = require("express");
const {
  create,
  list,
  listAllBlogsCategoriesTags,
  read,
  remove,
  update,
  photo,
  listRelated,
  listSearch,
  listByUser,
} = require("../controllers/caseStudies");
const {
  requireSignin,
  adminMiddleWare,
  authMiddleWare,
  canUpdateDeleteBlog,
} = require("../controllers/auth");
const router = express.Router();



router.get("/portfolio-list", list);
router.get("/portfolio/photo/:slug", photo);
router.post("/portfolio/related", listRelated);
router.get("/portfolio/search", listSearch);
router.get("/portfolio/:slug", read);




// For admin user
router.post("/portfolio-categories", listAllBlogsCategoriesTags);
router.delete("/portfolio/:slug", requireSignin, adminMiddleWare, remove);
router.put("/portfolio/:slug", requireSignin, adminMiddleWare, update);
router.post("/portfolio", requireSignin, adminMiddleWare, create);




// For normal user
router.post("/user/portfolio", requireSignin, authMiddleWare, create);
router.get("/:username/portfolio", listByUser);
router.delete(
  "/user/portfolio/:slug",
  requireSignin,
  authMiddleWare,
  canUpdateDeleteBlog,
  remove
);
router.put(
  "/user/portfolio/:slug",
  requireSignin,
  authMiddleWare,
  canUpdateDeleteBlog,
  update
);

module.exports = router;
