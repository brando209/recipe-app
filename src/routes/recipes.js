const express = require('express');
const router = express.Router();

const RecipeService = require('../services/RecipeService');
const service = new RecipeService();

router.get('/', async (req, res) => {
    const recipes = await service.getRecipes();
    return res.send(recipes);
});

router.get('/:recipeId', async (req, res) => {
    const recipeId = req.params.recipeId;
    const recipe = await service.getRecipe(recipeId);
    if(recipe) return res.send(recipe);
    return res.status(404).send("Recipe not found!");
});

router.post('/', async (req, res) => {
    //Validate the recipe info contained in the request body
    const recipeInfo = req.body;

    try {
        const newRecipe = await service.addRecipe(recipeInfo);
        if(!newRecipe) return res.status(400).send("Recipe not created!");
        return res.json(newRecipe);
    } catch(err) {
        console.log(err)
        res.sendStatus(500);
    }
});

router.delete('/:recipeId', async (req, res) => {
    const recipeId = req.params.recipeId;

    try {
        await service.deleteRecipe(recipeId);
        res.send("Recipe Deleted!");
    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
});

router.patch('/:recipeId', async (req, res) => {
    const recipeId = req.params.recipeId;
    
    try {
        const updatedRecipe = await service.updateRecipe(recipeId, req.body);
        res.send("Recipe Updated!");
    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
});

module.exports = router;