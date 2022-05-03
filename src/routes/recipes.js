const express = require('express');
const fs = require('fs');
const fetch = require('node-fetch');
const htmlParser = require('node-html-parser');
const router = express.Router();

const RecipeService = require('../services/RecipeService');
const service = new RecipeService();

const { validateRecipe } = require('../middlewares/validation');
const { authorizeJWT, authorizeUser, authorizeGuestPost } = require('../middlewares/authorization');
const { upload, uniqueFilename } = require('../middlewares/upload');

const { formatRecipe } = require('../utils/format');
const { extractRecipeJsonld } = require('../utils/jsonld');

router.use(authorizeJWT);

router.get('/', async (req, res) => {
    const recipes = await service.getRecipes(req.user.id);
    return res.send(recipes);
});

router.get('/import', async (req, res) => {
    console.log("Attempting to import recipe from:", req.query.importUrl);
    try {    
        const html = await fetch(req.query.importUrl).then(response => response.text());
        const root = htmlParser.parse(html);
        
        const recipeJsonld = await extractRecipeJsonld(root);

        const recipeInfo = formatRecipe(recipeJsonld);

        res.json(recipeInfo);
    } catch(err) {
        console.log(err);
        res.status(500).send(err.message);
    }
});

router.get('/:recipeId', authorizeUser, async (req, res) => {
    const recipeId = req.params.recipeId;
    const recipe = await service.getRecipe(recipeId, req.user.id);
    if (recipe) return res.send(recipe);
    return res.status(404).send("Recipe not found!");
});

router.post('/', upload.single('photo'), validateRecipe, authorizeGuestPost, async (req, res) => {
    const recipeInfo = req.body;

    if (req.file) {
        //A File object was recieved
        recipeInfo.photo = {
            //Remove 'public/' from path when storing in db
            path: req.file.path.substring(req.file.path.indexOf('/') + 1),
            mimetype: req.file.mimetype
        }
    } else if(recipeInfo.photo?.length > 0) {
        //Assume a url to a photo was recieved
        const imageExtRegex = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i;
        const extension = recipeInfo.photo.match(imageExtRegex);
        const pathname = 'uploads/' + uniqueFilename();
        //Fetch the photo and save it to filesystem
        await fetch(recipeInfo.photo).then(res => res.body.pipe(fs.createWriteStream(`public/${pathname}`)));
        recipeInfo.photo = {
            path: pathname,
            mimetype: `image/${extension[1] === "jpg" ? 'jpeg' : extension[1]}`
        }
    } else delete recipeInfo.photo;

    try {
        const newRecipe = await service.addRecipe(recipeInfo, req.user.id);
        if (!newRecipe) return res.status(400).send("Recipe not created!");

        return res.json(newRecipe);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

router.delete('/:recipeId', authorizeUser, async (req, res) => {
    const recipeId = req.params.recipeId;

    try {
        await service.deleteRecipe(recipeId);
        res.send("Recipe Deleted!");
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

router.patch('/:recipeId', authorizeUser, async (req, res) => {
    const recipeId = req.params.recipeId;

    try {
        const updatedRecipe = await service.updateRecipe(recipeId, req.body, req.user.id);
        res.json(updatedRecipe);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

module.exports = router;