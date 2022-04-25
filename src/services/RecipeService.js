const { Temporal } = require('@js-temporal/polyfill');
const iso8601Duration = require('iso8601-duration');

const Table = require('../database/Table');

const Recipe = new Table('recipes');
const Ingredient = new Table('ingredients');
const Category = new Table('categories');
const RecipeIngredient = new Table('recipe_ingredient');
const RecipeCategory = new Table('recipe_category');
const UserRecipe = new Table('user_recipe');
const Photo = new Table('photos');

const columnsArray = [
    'recipes.id', 'recipes.title', 'recipes.description', 'recipes.serves', 'recipes.instructions', 'recipes.comments',
    'recipes.prepTime', 'recipes.cookTime', 'recipes.totalTime', 'SUM(DISTINCT u_r.favorite) as favorite',
    'JSON_OBJECTAGG("data", JSON_OBJECT("path", p.path, "mimetype", p.mimetype)) as photo',
    'JSON_ARRAYAGG(JSON_OBJECT("name", i.name, "id", i.id, "quantity", ri.quantity, "unit", ri.unit, "size", ri.size)) as ingredients'
];

const joinsArray = [{
    table: `${RecipeIngredient.tableName} ri`,
    on: 'ri.recipe_id = recipes.id'
}, {
    table: `${Ingredient.tableName} i`,
    on: 'i.id = ri.ingredient_id'
}, {
    table: `${UserRecipe.tableName} u_r`,
    on: 'u_r.recipe_id = recipes.id'
}, {
    table: `${Photo.tableName} p`,
    on: 'p.recipeId = recipes.id',
    type: 'LEFT'
}];

function RecipeService() { }

RecipeService.prototype.addRecipe = async function (recipeInfo, creatorId) {
    //Convert time duration objects to ISO8601 string
    console.log(recipeInfo);
    const prepTime = new Temporal.Duration(0, 0, 0, recipeInfo.prepTime.days, recipeInfo.prepTime.hours, recipeInfo.prepTime.minutes);
    const cookTime = new Temporal.Duration(0, 0, 0, recipeInfo.cookTime.days, recipeInfo.cookTime.hours, recipeInfo.cookTime.minutes);
    const totalTime = new Temporal.Duration(0, 0, 0, recipeInfo.totalTime.days, recipeInfo.totalTime.hours, recipeInfo.totalTime.minutes);
    //Add an entry in the recipe table
    const newRecipe = await Recipe.addEntry({
        title: recipeInfo.title.trim(),
        instructions: recipeInfo.instructions.join("|"),
        description: recipeInfo.description?.trim() || null,
        prepTime: prepTime.toString(),
        cookTime: cookTime.toString(),
        totalTime: totalTime.toString(),
        serves: recipeInfo.serves,
        comments: (recipeInfo.comments && recipeInfo.comments.length > 0) ? recipeInfo.comments.join("|") : null
    });

    //Add entry to files table if photo is present
    if(recipeInfo.photo) {
        await Photo.addEntry({ ...recipeInfo.photo, recipeId: newRecipe.insertId });
    }

    //Add entry to user_recipe table which relates this recipe to the user who created it
    await UserRecipe.addEntry({ user_id: creatorId, recipe_id: newRecipe.insertId });

    //Add ingredients
    for (let ingredient of recipeInfo.ingredients) {
        const ingredientName = ingredient.name.trim().toLowerCase();
        //Add entries into the ingredients table, if not present
        const ingredientExists = await Ingredient.hasEntry({ name: ingredientName });

        const ingredientId = ingredientExists ?
            await Ingredient.getEntry({ rows: { name: ingredientName } }).then(entry => entry.id) :
            await Ingredient.addEntry({ name: ingredientName }).then(entry => entry.insertId);

        const ingredientQuantity = (ingredient.quantity && ingredient.quantity !== "") ? ingredient.quantity : null;
        const ingredientUnit = (ingredient.unit && ingredient.unit !== "") ? ingredient.unit : null;
        const ingredientSize = (ingredient.size && ingredient.size !== "") ? ingredient.size : null;

        //Add entry into recipe_ingredient table which relates this ingedient to the recipe
        await RecipeIngredient.addEntry({
            recipe_id: newRecipe.insertId,
            ingredient_id: ingredientId,
            quantity: ingredientQuantity,
            unit: ingredientUnit,
            size: ingredientSize,
        });
    }

    //Add categories
    for(let category of recipeInfo.categories) {
        const categoryName = category.name.trim().toLowerCase();
        //Add entries into the categories table, if not present
        const categoryExists = await Category.hasEntry({ name: categoryName });

        const categoryId = categoryExists ? 
            await Category.getEntry({ rows: { name: categoryName } }).then(entry => entry.id) :
            await Category.addEntry({ name: categoryName, type: category.type }).then(entry => entry.insertId);

        //Add entry into recipe_category table which relates this category to the recipe
        await RecipeCategory.addEntry({
            recipe_id: newRecipe.insertId,
            category_id: categoryId
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

    const recipePromises = recipes.map(async recipe => {
        const categories = await RecipeCategory.getEntries({
            rows: { 'recipe_category.recipe_id': recipe.id },
            columns: ['c.id', 'c.name', 'c.type'],
            joins: [{
                table: `${Category.tableName} c`,
                on: `c.id = recipe_category.category_id`
            }]
        });

        const prepTime = iso8601Duration.parse(recipe.prepTime);
        const cookTime = iso8601Duration.parse(recipe.cookTime);
        const totalTime = iso8601Duration.parse(recipe.totalTime);

        return {
            ...recipe,
            prepTime: { days: prepTime.days, hours: prepTime.hours, minutes: prepTime.minutes },
            cookTime: { days: cookTime.days, hours: cookTime.hours, minutes: cookTime.minutes },
            totalTime: { days: totalTime.days, hours: totalTime.hours, minutes: totalTime.minutes },
            ingredients: JSON.parse(recipe.ingredients),
            instructions: recipe.instructions.split("|"),
            comments: recipe.comments && recipe.comments.split("|"),
            favorite: recipe.favorite ? true : false,
            photo: JSON.parse(recipe.photo).data,
            categories: categories
        }
    });

    return Promise.all(recipePromises);
}

RecipeService.prototype.getRecipe = async function (recipeId, userId) {
    const recipe = await Recipe.getEntry({
        rows: { 'recipes.id': recipeId, 'u_r.user_id': userId },
        columns: columnsArray,
        joins: joinsArray
    });

    if (!recipe.id) return;

    const categories = await RecipeCategory.getEntries({
        rows: { 'recipe_category.recipe_id': recipeId },
        columns: ['c.id', 'c.name', 'c.type'],
        joins: [{
            table: `${Category.tableName} c`,
            on: `c.id = recipe_category.category_id`
        }]
    });

    const prepTime = iso8601Duration.parse(recipe.prepTime);
    const cookTime = iso8601Duration.parse(recipe.cookTime);
    const totalTime = iso8601Duration.parse(recipe.totalTime);

    return {
        ...recipe,
        prepTime: { days: prepTime.days, hours: prepTime.hours, minutes: prepTime.minutes },
        cookTime: { days: cookTime.days, hours: cookTime.hours, minutes: cookTime.minutes },
        totalTime: { days: totalTime.days, hours: totalTime.hours, minutes: totalTime.minutes },
        ingredients: JSON.parse(recipe.ingredients),
        instructions: recipe.instructions.split("|"),
        comments: recipe.comments && recipe.comments.split("|"),
        favorite: recipe.favorite ? true : false,
        photo: JSON.parse(recipe.photo).data,
        categories: categories
    }
}

RecipeService.prototype.updateRecipe = async function (recipeId, updates, userId) {
    const { title, description, instructions, comments, serves, prepTime, cookTime, totalTime, categories, ingredients, favorite } = updates;
    const isUpdatingRecipeInfo = title || description || instructions || comments || serves || prepTime || cookTime || totalTime;
    
    const update = {};
    if(title) update.title = title.trim();
    if(description) update.description = description.trim();
    if(instructions) update.instructions = instructions.join("|");
    if(comments) update.comments = comments.join("|");
    if(serves) update.serves = serves;
    if(prepTime) update.prepTime = new Temporal.Duration(0, 0, 0, prepTime.days, prepTime.hours, prepTime.minutes);
    if(cookTime) update.cookTime = new Temporal.Duration(0, 0, 0, cookTime.days, cookTime.hours, cookTime.minutes);
    if(totalTime) update.totalTime = new Temporal.Duration(0, 0, 0, totalTime.days, totalTime.hours, totalTime.minutes);

    //Update recipe information
    isUpdatingRecipeInfo && await Recipe.updateEntries({ id: recipeId }, update);

    //Update ingredient information
    for (let name in ingredients) {
        const ingredientName = name.trim();
        const ingredient = await Ingredient.getEntry({ rows: { name: ingredientName } });
        const isRemoving = ingredients[name] === null;

        if(!ingredient && isRemoving) continue;
        
        const ingredientId = ingredient ? ingredient.id : await Ingredient.addEntry({ name: ingredientName }).then(entry => entry.insertId);
        
        const existsInRecipe = await RecipeIngredient.getEntry({ rows: { recipe_id: recipeId, ingredient_id: ingredientId } });

        if(existsInRecipe && isRemoving) {
            await RecipeIngredient.removeEntries({ recipe_id: recipeId, ingredient_id: ingredientId });
            continue;
        }

        if(!existsInRecipe && isRemoving) continue;

        const ingredientQuantity = (ingredients[name]?.quantity !== "") ? ingredients[name]?.quantity : null;
        const ingredientUnit = (ingredients[name]?.unit !== "") ? ingredients[name]?.unit : null;
        const ingredientSize = (ingredients[name]?.size !== "") ? ingredients[name]?.size : null;
        
        if(existsInRecipe) {
            await RecipeIngredient.updateEntries(
                { recipe_id: recipeId, ingredient_id: ingredientId },
                { quantity: ingredientQuantity, unit: ingredientUnit, size: ingredientSize }
            );
            continue;
        }

        await RecipeIngredient.addEntry({
            recipe_id: recipeId,
            ingredient_id: ingredientId,
            quantity: ingredientQuantity,
            unit: ingredientUnit,
            size: ingredientSize,
        })
    }
    //Update category information
    for(let name in categories) {
        const categoryName = name.trim().toLowerCase();
        const category = await Category.getEntry({ rows: { name: categoryName } });
        const isRemoving = categories[name] === null;

        if(!category && isRemoving) continue;

        const categoryId = category ? category.id : await Category.addEntry({ 
            name: categoryName, 
            type: categories[name].type ? categories[name].type : 'other'
        }).then(entry => entry.insertId);

        const existsInRecipe = await RecipeCategory.getEntry({ rows: { recipe_id: recipeId, category_id: categoryId } });

        if(existsInRecipe && isRemoving) {
            await RecipeCategory.removeEntries({ recipe_id: recipeId, category_id: categoryId });
            continue;
        }

        if(!existsInRecipe) {
            await RecipeCategory.addEntry({ recipe_id: recipeId, category_id: categoryId });
        }
    }

    //Update favorited recipe
    favorite !== undefined && UserRecipe.updateEntries({ user_id: userId, recipe_id: recipeId }, { favorite: favorite ? 1 : 0 });

    return this.getRecipe(recipeId);
}

RecipeService.prototype.deleteRecipe = function (recipeId) {
    return Recipe.removeEntries({ id: recipeId });
}

module.exports = RecipeService;