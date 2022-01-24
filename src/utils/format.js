const recipeIngredientParser = require('ingredients-parser');
const iso8601Duration = require('iso8601-duration');
const { unitsMap } = require('../utils/units');
const { toDecimal } = require('../utils/numbers');
const { convertUnicodeFraction, cleanString } = require('../utils/strings');

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
        //TODO: Sometimes opening parens is a converted measurement, ex: 6g (1 tsp) coarse kosher salt
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
    let i = 0;

    //Sometimes instructions will be divided into sections, ex. Chicken wings & Buffalo sauce
    //If these exists we will have a 2-D array for our instructions where the first entry of each
    //inner array is the name of the section and the rest of the entries are the instructions for that section
    if(instructions[0].type === "HowToSection") {
        for(let section of instructions) {
            // const sectionInstructions = [section.name];
            for(let instruction of section.itemListElement) {
                formatted.push(cleanString(instruction.text)); 
            }
            // formatted.push(sectionInstructions);
        }
    }

    //If there are no sections, we have a single array for our instructions
    if(instructions[0].type === "HowToStep") {
        for(let instruction of instructions) {
            formatted.push(cleanString(instruction.text));
        }
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
        cook: formatTime(recipeInfo.cookTime),
        prep: formatTime(recipeInfo.prepTime),
        serves: formatServings(recipeInfo.recipeYield),
        comments: []
    }
}

module.exports = { formatRecipe } 