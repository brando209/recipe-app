const express = require('express');
const router = express.Router();

const IngredientService = require('../services/IngredientService');
const service = new IngredientService();

router.get('/', async (req, res) => {
    const ingredients = await service.getIngredients();
    console.log(ingredients);
    return res.send(ingredients);
});

module.exports = router;