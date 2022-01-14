const express = require('express');
const router = express.Router();

const CategoryService = require('../services/CategoryService');
const service = new CategoryService();

router.get('/', async (req, res) => {
    const categories = await service.getCategories();
    return res.send(categories);
});

module.exports = router;