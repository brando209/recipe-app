const Table = require('../database/Table');

const Recipe = new Table('recipes');
const Ingredient = new Table('ingredients');
const RecipeIngredient = new Table('recipe_ingredient');

const columnsArray = [
    'recipes.id', 'recipes.title', 'recipes.description', 'recipes.serves', 'recipes.instructions', 'recipes.comments',
    'JSON_OBJECT("time", recipes.prepTime, "unit", recipes.prepUnit) as prep',
    'JSON_OBJECT("time", recipes.cookTime, "unit", recipes.cookUnit) as cook',
    'JSON_OBJECTAGG(i.name, JSON_OBJECT("amount", ri.amount, "measurement", ri.measurement, "size", ri.size)) as ingredients'
];

const joinsArray = [{
    table: `${RecipeIngredient.tableName} ri`,
    on: 'ri.recipe_id = recipes.id'
}, {
    table: `${Ingredient.tableName} i`,
    on: 'i.id = ri.ingredient_id'
}];

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

        const ingredientId = ingredientExists ?
            await Ingredient.getEntry({ rows: { name: ingredient.name } }).then(entry => entry.id) :
            await Ingredient.addEntry({ name: ingredient.name }).then(entry => entry.insertId);

        const ingredientAmount = (ingredient.amount && ingredient.amount !== "") ? ingredient.amount : null;
        const ingredientMeasurement = (ingredient.measurement && ingredient.measurement !== "") ? ingredient.measurement : null;
        const ingredientSize = (ingredient.size && ingredient.size !== "") ? ingredient.size : null;

        await RecipeIngredient.addEntry({
            recipe_id: newRecipe.insertId,
            ingredient_id: ingredientId,
            amount: ingredientAmount,
            measurement: ingredientMeasurement,
            size: ingredientSize,
        });
    }

    return this.getRecipe(newRecipe.insertId);
}

RecipeService.prototype.getRecipes = async function () {
    const recipes = await Recipe.getEntries({
        columns: columnsArray,
        joins: joinsArray,
        groupBy: 'recipes.id'
    });

    if (!recipes.length) return;

    return recipes.map(recipe => ({
        ...recipe,
        prep: JSON.parse(recipe.prep),
        cook: JSON.parse(recipe.cook),
        ingredients: JSON.parse(recipe.ingredients),
        instructions: recipe.instructions.split("|"),
        comments: recipe.comments && recipe.comments.split("|")
    }))
}

RecipeService.prototype.getRecipe = async function (recipeId) {
    const recipe = await Recipe.getEntry({
        rows: { 'recipes.id': recipeId },
        columns: columnsArray,
        joins: joinsArray
    });

    if (!recipe.id) return;

    return {
        ...recipe,
        prep: JSON.parse(recipe.prep),
        cook: JSON.parse(recipe.cook),
        ingredients: JSON.parse(recipe.ingredients),
        instructions: recipe.instructions.split("|"),
        comments: recipe.comments && recipe.comments.split("|")
    }
}

RecipeService.prototype.updateRecipe = async function (recipeId, updates) {
    const { title, description, instructions, comments, serves, prep, cook, ingredients } = updates;

    await Recipe.updateEntries({ id: recipeId }, {
        title, description, serves,
        instructions: instructions?.join("|"),
        comments: comments?.join("|"),
        prepTime: prep?.time, prepUnit: prep?.unit,
        cookTime: cook?.time, cookUnit: cook?.unit,
    });

    for (let ingredientName in ingredients) {
        const ingredient = await Ingredient.getEntry({ rows: { name: ingredientName } });
        const isRemoving = ingredients[ingredientName] === null;
        
        if(!ingredient && isRemoving) continue;
        
        const ingredientId = ingredient ? ingredient.id : await Ingredient.addEntry({ name: ingredientName }).then(entry => entry.insertId);
        
        const existsInRecipe = await RecipeIngredient.getEntry({ rows: { recipe_id: recipeId, ingredient_id: ingredient.id } });

        if(existsInRecipe && isRemoving) {
            await RecipeIngredient.removeEntries({ recipe_id: recipeId, ingredient_id: ingredientId });
            continue;
        }

        if(!existsInRecipe && isRemoving) continue;

        const ingredientAmount = (ingredients[ingredientName]?.amount !== "") ? ingredients[ingredientName]?.amount : null;
        const ingredientMeasurement = (ingredients[ingredientName]?.measurement !== "") ? ingredients[ingredientName]?.measurement : null;
        const ingredientSize = (ingredients[ingredientName]?.size !== "") ? ingredients[ingredientName]?.size : null;
        
        if(existsInRecipe) {
            await RecipeIngredient.updateEntries(
                { recipe_id: recipeId, ingredient_id: ingredientId },
                { amount: ingredientAmount, measurement: ingredientMeasurement, size: ingredientSize }
            );
            continue;
        }

        await RecipeIngredient.addEntry({
            recipe_id: recipeId,
            ingredient_id: ingredientId,
            amount: ingredientAmount,
            measurement: ingredientMeasurement,
            size: ingredientSize,
        })
    }

    return this.getRecipe(recipeId);
}

RecipeService.prototype.deleteRecipe = function (recipeId) {
    return Recipe.removeEntries({ id: recipeId });
}

module.exports = RecipeService;