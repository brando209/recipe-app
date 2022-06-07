const recipeIngredientParser = require('ingredientparserjs');
const iso8601Duration = require('iso8601-duration');
const { cleanString } = require('../utils/strings');

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
        let { name, measurement, hasAlternativeIngredients, hasAddedMeasurements, additional } = recipeIngredientParser.parse(ingredient);
        const alternateIngredientNames = hasAlternativeIngredients ? name.splice(1, name.length - 1) : null;
        name = hasAlternativeIngredients ? name[0] : name;
        let quantity = measurement?.quantity;
        let unitIsSize = ['small', 'medium', 'large'].includes(measurement?.unit);
        let unit = unitIsSize ? null : measurement?.unit;
        let size = unitIsSize ? measurement?.unit : null;
        
        //If there are added measurements in the ingredient(i.e. '1 tbsp + 1 tsp'), then quantity, unit, and size become arrays
        //where the ith entry of each correspond to the ith measurement(i.e. quantity[0], unit[0], and size[0] describe the first measurement,
        //quantity[1], unit[1], and size[1] describe the second measurement, and so on)
        if(hasAddedMeasurements) {
            quantity = [];
            unit = [];
            size = [];
            measurement.forEach(meas => {
                unitIsSize = ['small', 'medium', 'large'].includes(meas?.unit)
                quantity.push(meas?.quantity);
                unit.push(unitIsSize ? null : meas?.unit);
                size.push(unitIsSize ? meas?.unit : null);
            })
        }

        formatted.push({
            name: name,
            quantity: quantity,
            unit: unit,
            size: size,
            comment: additional,
            alternateIngredients: alternateIngredientNames
        })
    }
    
    return formatted;
}

const formatInstructions = (instructions) => {
    const formatted = [];

    for(let instruction of instructions) {
        if(instruction.type === "HowToStep") {
            formatted.push(cleanString(instruction.text));
        }

        if(instruction.type === "HowToSection") {
            for(let step of instruction.itemListElement) {
                formatted.push(cleanString(step.text)); 
            }
        }
    }

    return formatted;
}

const formatTime = (time) => {
    if(!time) return;
    const duration = iso8601Duration.parse(time);
    return { days: duration.days, hours: duration.hours, minutes: duration.minutes }
}

//Assumes if servings is an array then the first entry is the low value, while the second is a range. Ignores range.
const formatServings = (servings) => {
    if(Array.isArray(servings)) return Number(servings[0]);
    return Number(servings);
}

const formatPhoto = (photos) => {
    if(Array.isArray(photos)) return photos[0];
    else if(photos?.url) return photos.url;
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
        cookTime: formatTime(recipeInfo.cookTime),
        prepTime: formatTime(recipeInfo.prepTime),
        totalTime: formatTime(recipeInfo.totalTime),
        serves: formatServings(recipeInfo.recipeYield),
        comments: []
    }
}

module.exports = { formatRecipe } 