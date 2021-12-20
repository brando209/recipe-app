const Table = require('../database/Table');

const Recipe = new Table('recipes');
const Ingredient = new Table('ingredients');
const RecipeIngredient = new Table('recipe_ingredient')
const UserRecipe = new Table('user_recipe');
const Photo = new Table('photos');

const columnsArray = [
    'recipes.id', 'recipes.title', 'recipes.description', 'recipes.serves', 'recipes.instructions', 'recipes.comments', 'SUM(DISTINCT u_r.favorite) as favorite',
    'JSON_OBJECTAGG("data", JSON_OBJECT("path", p.path, "mimetype", p.mimetype)) as photo',
    'JSON_OBJECT("time", recipes.prepTime, "unit", recipes.prepUnit) as prep',
    'JSON_OBJECT("time", recipes.cookTime, "unit", recipes.cookUnit) as cook',
    'JSON_ARRAYAGG(JSON_OBJECT("name", i.name, "id", i.id, "amount", ri.amount, "measurement", ri.measurement, "size", ri.size)) as ingredients'
];

const joinsArray = [{
    table: `${RecipeIngredient.tableName} ri`,
    on: 'ri.recipe_id = recipes.id'
}, {
    table: `${Ingredient.tableName} i`,
    on: 'i.id = ri.ingredient_id'
}, {
    table: `${UserRecipe.tableName} u_r`,
    on: `u_r.recipe_id = recipes.id`
}, {
    table: `${Photo.tableName} p`,
    on: `p.recipeId = recipes.id`,
    type: 'LEFT'
}];

function RecipeService() { }

RecipeService.prototype.addRecipe = async function (recipeInfo, creatorId) {
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
        comments: (recipeInfo.comments && recipeInfo.comments.length > 0) ? recipeInfo.comments.join("|") : null
    });

    //Add entry to files table if photo is present
    let file = null;
    if(recipeInfo.photo) {
        file = await Photo.addEntry({ ...recipeInfo.photo, recipeId: newRecipe.insertId });
    }

    //Add entry to user_recipe table which relates this recipe to the user who created it
    await UserRecipe.addEntry({ user_id: creatorId, recipe_id: newRecipe.insertId });

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

RecipeService.prototype.getRecipes = async function (userId) {
    const recipes = await Recipe.getEntries({
        rows: { 'u_r.user_id': userId },
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
        comments: recipe.comments && recipe.comments.split("|"),
        favorite: recipe.favorite ? true : false,
        photo: JSON.parse(recipe.photo).data
    }))
}

RecipeService.prototype.getRecipe = async function (recipeId, userId) {
    const recipe = await Recipe.getEntry({
        rows: { 'recipes.id': recipeId, 'u_r.user_id': userId },
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
        comments: recipe.comments && recipe.comments.split("|"),
        favorite: recipe.favorite ? true : false,
        photo: JSON.parse(recipe.photo).data
    }
}

RecipeService.prototype.updateRecipe = async function (recipeId, updates, userId) {
    const { title, description, instructions, comments, serves, prep, cook, ingredients, favorite } = updates;
    const isUpdatingRecipeInfo = title || description || instructions || comments || serves || prep || cook;
    
    //Update recipe information
    isUpdatingRecipeInfo && await Recipe.updateEntries({ id: recipeId }, {
        title, description, serves,
        instructions: instructions?.join("|"),
        comments: comments?.join("|"),
        prepTime: prep?.time, prepUnit: prep?.unit,
        cookTime: cook?.time, cookUnit: cook?.unit,
    });

    //Update ingredient information
    for (let ingredientName in ingredients) {
        const ingredient = await Ingredient.getEntry({ rows: { name: ingredientName } });
        const isRemoving = ingredients[ingredientName] === null;
        
        if(!ingredient && isRemoving) continue;
        
        const ingredientId = ingredient ? ingredient.id : await Ingredient.addEntry({ name: ingredientName }).then(entry => entry.insertId);
        
        const existsInRecipe = await RecipeIngredient.getEntry({ rows: { recipe_id: recipeId, ingredient_id: ingredient?.id } });

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

    //Update favorited recipe
    favorite !== undefined && UserRecipe.updateEntries({ user_id: userId, recipe_id: recipeId }, { favorite: favorite ? 1 : 0 });

    return this.getRecipe(recipeId);
}

RecipeService.prototype.deleteRecipe = function (recipeId) {
    return Recipe.removeEntries({ id: recipeId });
}

module.exports = RecipeService;