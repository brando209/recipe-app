const Table = require('../database/Table');

const Recipes = new Table('recipes');

function RecipeService() { }

RecipeService.prototype.addRecipe = async function (recipeInfo) {
    //Add an entry in the recipe table
    const addResult = await Recipes.addEntry({
        title: recipeInfo.title,
        instructions: recipeInfo.instructions.join("|"),
        description: recipeInfo.description || null,
        prepTime: recipeInfo.prep.time || 0,
        prepUnit: recipeInfo.prep.unit,
        cookTime: recipeInfo.cook.time || 0,
        cookUnit: recipeInfo.cook.unit,
        serves: recipeInfo.serves,
        comments: recipeInfo.comments && recipeInfo.comments.join("|")
    });

    return this.getRecipe(addResult.insertId);
}

RecipeService.prototype.getRecipes = async function () {
    const recipes = await Recipes.getEntries();
    return recipes;
}

RecipeService.prototype.getRecipe = async function (recipeId) {
    const recipe = await Recipes.getEntry(recipeId);
    return recipe[0];
}

RecipeService.prototype.updateRecipe = async function (recipeId, updates) {
    const updatedRecipe = await Recipes.updateEntry(recipeId, updates);
    return Recipes.getEntry(recipeId);
}

RecipeService.prototype.deleteRecipe = function (recipeId) {
    return Recipes.removeEntry(recipeId);
}

module.exports = RecipeService;