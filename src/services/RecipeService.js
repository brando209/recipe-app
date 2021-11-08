const Table = require('../database/Table');

const Recipe = new Table('recipes');
const Ingredient = new Table('ingredients');
const RecipeIngredient = new Table('recipe_ingredient');

function RecipeService() { }

RecipeService.prototype.addRecipe = async function (recipeInfo) {
    //Add an entry in the recipe table
    const newRecipe = await Recipe.addEntry({
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

    return this.getRecipe(newRecipe.insertId);
}

RecipeService.prototype.getRecipes = async function () {
    return Recipe.getEntries();
}

RecipeService.prototype.getRecipe = async function (recipeId) {
    return Recipe.getEntry({ id: recipeId });
}

RecipeService.prototype.updateRecipe = async function (recipeId, updates) {
    await Recipe.updateEntry({ id: recipeId }, updates);
    return Recipe.getEntry({ id: recipeId });
}

RecipeService.prototype.deleteRecipe = function (recipeId) {
    return Recipe.removeEntry({ id: recipeId });
}

module.exports = RecipeService;