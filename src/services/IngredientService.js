const Table = require('../database/Table');

const Ingredient = new Table('ingredients');

function IngredientService() { }

IngredientService.prototype.getIngredients = async function () {
    const ingredients = await Ingredient.getEntries();
    return ingredients;    
}

IngredientService.prototype.deleteIngredient = function (ingredientId) {
    return Ingredient.removeEntries({ id: ingredientId });
}

module.exports = IngredientService;