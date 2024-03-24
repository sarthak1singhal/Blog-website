const express = require('express');
const router = express.Router();

// Validators
const { runValidation } = require('../validators');
const { createTagValidator } = require('../validators/tag');

// Controllers
const { requireSignin, adminMiddleWare } = require('../controllers/auth');
const { create, list, read, remove } = require('../controllers/funding-tags');

router.post('/funding-tags', createTagValidator, runValidation, requireSignin, adminMiddleWare, create);
router.get('/funding-tags', list);
router.get('/funding-tags/:slug', read);
router.delete('/funding-tags/:slug', requireSignin, adminMiddleWare, remove);

module.exports = router;