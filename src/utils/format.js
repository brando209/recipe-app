const recipeIngredientParser = require('ingredients-parser');
const iso8601Duration = require('iso8601-duration');
const { unitsMap } = require('../utils/units');
const { toDecimal } = require('../utils/numbers');
const { convertUnicodeFraction } = require('../utils/strings');

const formatCategories = (cuisines, others) => {
    const categories = [];

    if(cuisines) {
        if(Array.isArray(cuisines)) {
            for(let cuisine of cuisines) categories.push({ 'name': cuisine, 'type': 'cuisine' });
        } else categories.push({ 'name': cuisines, 'type': 'cuisine' });
    }

    if(others) {
        if(Array.isArray(others)) {
            for(let other of others) categories.push({ 'name': other, 'type': 'other' });
        } else categories.push({ 'name': others, 'type': 'other' });
    }

    return categories;
}

const formatIngredients = (ingredients) => {
    const formatted = [];
    for(let ingredient of ingredients) {
        ingredient = convertUnicodeFraction(ingredient);

        const { ingredient: name, amount, unit } = recipeIngredientParser.parse(ingredient);
        
        //Assumes opening parens begins the comment/prepared info section.
        // ex. '8 ounces flat rice noodles (carefully separated)'
        const nameEnd = name.indexOf("(");

        formatted.push({
            name: nameEnd === -1 ? name : name.substring(0, nameEnd),
            amount: toDecimal(amount),
            measurement: unitsMap.get(unit),
            comment: nameEnd === -1 ? null : name.substring(nameEnd)
        })
    }

    return formatted;
}

const formatInstructions = (instructions) => {
    const formatted = [];
    for(let instruction of instructions) {
        formatted.push(instruction.text.replace(/&nbsp;/g, ' ')); //TODO: Consider other HTML Entities
    }
    return formatted;
}

//Assues all times will be in either hours or minutes
const formatTime = (time) => {
    const duration = iso8601Duration.parse(time);
    if(duration.hours > 0) {
        return {
            time: duration.hours,
            unit: "hr"
        }
    }

    return {
        time: duration.minutes,
        unit: "min"
    }
}

//Assumes if servings is an array then the first entry is the low value, while the second is a range. Ignores range.
const formatServings = (servings) => {
    if(Array.isArray(servings)) return Number(servings[0]);
    return Number(servings);
}

const formatPhoto = (photos) => {
    if(Array.isArray(photos)) return photos[0];
    else if(photos.url) return photos.url;
    else return photos;
}

const formatRecipe = (recipeInfo) => {
    return {
        title: recipeInfo.name,
        description: recipeInfo.description,
        photo: formatPhoto(recipeInfo.image),
        categories: formatCategories(recipeInfo.recipeCuisine, recipeInfo.recipeCategory),
        ingredients: formatIngredients(recipeInfo.recipeIngredient),
        instructions: formatInstructions(recipeInfo.recipeInstructions),
        cook: formatTime(recipeInfo.cookTime),
        prep: formatTime(recipeInfo.prepTime),
        serves: formatServings(recipeInfo.recipeYield)
    }
}

module.exports = { formatRecipe } 