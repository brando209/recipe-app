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

    //Add entries into the ingredients table as well as the recipe_ingredient table
    for (let ingredient of recipeInfo.ingredients) {
        const ingredientExists = await Ingredient.hasEntry({ name: ingredient.name });

        const ingredientInfo = ingredientExists ?
            await Ingredient.getEntry({ rows: { name: ingredient.name }}) :
            await Ingredient.addEntry({ name: ingredient.name });

        const ingredientAmount = (ingredient.amount && ingredient.amount !== "") ? ingredient.amount : null;
        const ingredientMeasurement = (ingredient.measurement && ingredient.measurement !== "") ? ingredient.measurement : null;
        const ingredientSize = (ingredient.size && ingredient.size !== "") ? ingredient.size : null;

        await RecipeIngredient.addEntry({
            recipe_id: newRecipe.insertId,
            ingredient_id: ingredientInfo.id,
            amount: ingredientAmount,
            measurement: ingredientMeasurement,
            size: ingredientSize,
        });
    }

    return this.getRecipe(newRecipe.insertId);
}

RecipeService.prototype.getRecipes = async function () {
    return Recipe.getEntries();
}

RecipeService.prototype.getRecipe = async function (recipeId) {
    const recipe = await Recipe.getEntry({ 
        rows: { 'recipes.id': recipeId },
        columns: [
            'recipes.id', 'recipes.title', 'recipes.description', 'recipes.serves', 'recipes.instructions', 'recipes.comments',
            'JSON_OBJECTAGG(i.name, JSON_OBJECT("amount", ri.amount, "measurement", ri.measurement, "size", ri.size)) as ingredients'
        ],
        joins: [{
            table: 'recipe_ingredient ri',
            on: 'ri.recipe_id = recipes.id'
        }, {
            table: 'ingredients i',
            on: 'i.id = ri.ingredient_id'
        }]
    });

    if(!recipe.id) return;
    
    return {
        ...recipe,
        comments: recipe.comments && recipe.comments.split("|"),
        instructions: recipe.instructions.split("|"),
        ingredients: JSON.parse(recipe.ingredients)
    }
}

RecipeService.prototype.updateRecipe = async function (recipeId, updates) {
    await Recipe.updateEntries({ id: recipeId }, updates);
    return this.getRecipe(recipeId);
}

RecipeService.prototype.deleteRecipe = function (recipeId) {
    return Recipe.removeEntries({ id: recipeId });
}

module.exports = RecipeService;