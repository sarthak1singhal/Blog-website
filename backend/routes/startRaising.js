const express = require("express");
const {
    createUserFormData,
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
} = require("../controllers/startRaising");
const {
  requireSignin,
  adminMiddleWare,
  authMiddleWare,
  canUpdateDeleteBlog,
} = require("../controllers/auth");
const router = express.Router();

// For admin user
router.post("/fund-raising", requireSignin, adminMiddleWare, create);
router.post("/fund-raising-categories-tags", listAllBlogsCategoriesTags);
router.delete("/fund-raising/:slug", requireSignin, adminMiddleWare, remove);
router.put("/fund-raising/:slug", requireSignin, adminMiddleWare, update);


// router.get("/startRaising",);

// For admin user
router.post("/fund-raising", requireSignin, adminMiddleWare, create);
router.post("/fund-raising-categories-tags", listAllBlogsCategoriesTags);
router.delete("/fund-raising/:slug", requireSignin, adminMiddleWare, remove);
router.put("/fund-raising/:slug", requireSignin, adminMiddleWare, update);


router.get("/fund-raising", list);
router.post("/fund-raising-data", list);
// router.get("/blog/photo/:slug", photo);
router.post("/fund-raising/related", listRelated);
router.get("/fund-raising/search", listSearch);
router.get("/fund-raising/:slug", read);



// For normal user
router.post("/fund-raising/blog", requireSignin, authMiddleWare, create);
router.get("/:username/fund-raising", listByUser);
router.delete(
  "/user/fund-raising/:slug",
  requireSignin,
  authMiddleWare,
  canUpdateDeleteBlog,
  remove
);


router.post("/postingdata", createUserFormData);

module.exports = router;
