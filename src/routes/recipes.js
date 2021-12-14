const express = require('express');
const router = express.Router();

const RecipeService = require('../services/RecipeService');
const service = new RecipeService();

const { validateRecipe } = require('../middlewares/validation');
const { authorizeJWT, authorizeUser } = require('../middlewares/authorization');
const upload = require('../middlewares/upload');

router.use(authorizeJWT);

router.get('/', async (req, res) => {
    const recipes = await service.getRecipes(req.user.id);
    return res.send(recipes);
});

router.get('/:recipeId', authorizeUser, async (req, res) => {
    const recipeId = req.params.recipeId;
    const recipe = await service.getRecipe(recipeId, req.user.id);
    if(recipe) return res.send(recipe);
    return res.status(404).send("Recipe not found!");
});

router.post('/', upload.single('photo'), validateRecipe, async (req, res) => {
    const recipeInfo = req.body;

    if(req.file) {
        //Remove 'public/' from path when storing in db
        recipeInfo.photo = {
            path: req.file.path.substring(req.file.path.indexOf('/')+1),
            mimetype: req.file.mimetype
        }
    } else delete recipeInfo.photo;

    try {
        const newRecipe = await service.addRecipe(recipeInfo, req.user.id);
        if(!newRecipe) return res.status(400).send("Recipe not created!");

        return res.json(newRecipe);
    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
});

router.delete('/:recipeId', authorizeUser, async (req, res) => {
    const recipeId = req.params.recipeId;

    try {
        await service.deleteRecipe(recipeId);
        res.send("Recipe Deleted!");
    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
});

router.patch('/:recipeId', authorizeUser, async (req, res) => {
    const recipeId = req.params.recipeId;
    
    try {
        const updatedRecipe = await service.updateRecipe(recipeId, req.body, req.user.id);
        res.json(updatedRecipe);
    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
});

module.exports = router;