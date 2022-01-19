const units = {
    bag: ['bag'],
    box: ['box'],
    can: ['can'],
    cup: ['cup', 'c', 'c.', 'C', 'C.', 'Cups'],
    clove: ['clove'],
    gallon: ['gallon','gal'],
    ounce: ['ounce', 'oz', 'oz.'],
    pint: ['pint','pt', 'pts', 'pt.'],
    pound: ['pound','lb', 'lb.', 'lbs', 'lbs.', 'Lb', 'Lbs'],
    quart: ['quart', 'qt', 'qt.', 'qts', 'qts.'],
    tablespoon: ['tablespoon', 'tbs', 'tbsp', 'tbspn', 'Tbsp.', 'T', 'T.', 'Tablespoons', 'Tablespoon'],
    teaspoon: ['teaspoon', 'tsp', 'tsp.', 'tspn', 't', 't.'],
    gram: ['gram', 'g', 'g.'],
    kilogram: ['kilogram', 'kg', 'kg.', 'Kg', 'Kg.'],
    liter: ['liter', 'l', 'l.', 'lt', 'Lt', 'LT', 'L', 'L.'],
    milligram: ['milligram', 'mg', 'mg.'],
    milliliter: ['milliliter', 'ml', 'ml.', 'mL', 'mL.'],
    package: ['package','pkg', 'pkgs'],
    piece: ['piece', 'pcs', 'pcs.'],
    pinch: ['pinch'],
    slice: ['slice'],
    stick: ['stick'],
    small: ['small', 'Small'],
    medium: ['medium', 'Medium'],
    large: ['large', 'Large'],
}

const pluralUnits = {
    bag: 'bags',
    box: 'boxes',
    can: 'cans',
    cup: 'cups',
    clove: 'cloves',
    gallon: 'gallons',
    ounce: 'ounces',
    pint: 'pints',
    pound: 'pounds',
    quart: 'quarts',
    tablespoon: 'tablespoons',
    teaspoon: 'teaspoons',
    gram: 'grams',
    kilogram: 'kilograms',
    liter: 'liters',
    milligram: 'milligrams',
    milliliter: 'milliliters',
    package: 'packages',
    piece: 'pieces',
    pinch: 'pinches',
    slice: 'slices',
    stick: 'sticks',
    piece: 'pieces'
  }

const unitsMap = new Map();

for(let unit in units) {
    for(let entry of units[unit]) {
        unitsMap.set(entry, unit);
    }
}

for(let unit in pluralUnits) {
    unitsMap.set(pluralUnits[unit], unit);
}

module.exports = { unitsMap };

// ["Preheat oven to 325 degrees F and grease a 3 qt baking dish (9x13\"). &nbsp;Set aside.","Bring a large pot of salted water to a boil. &nbsp;When boiling, add dried pasta and cook 1 minute less than the package directs for al dente. &nbsp;Drain and drizzle with a little bit of olive oil to keep from sticking.","While water is coming up to a boil, grate cheeses and toss together to mix, then divide into three piles. &nbsp;Approximately 3 cups for the sauce, 1 1/2 cups for the inner layer, and 1 1/2 cups for the topping.","Melt butter in a large saucepan over MED heat. &nbsp;Sprinkle in flour and whisk to combine. &nbsp;Mixture will look like very wet sand. &nbsp;Cook for approximately 1 minute, whisking often. &nbsp;Slowly pour in about 2 cups or so of the milk/half and half, while whisking constantly, until smooth. &nbsp;Slowly pour in the remaining milk/half and half, while whisking constantly, until combined and smooth.","Continue to heat over MED heat, whisking very often, until thickened to a very thick consistency. &nbsp;It should almost be the consistency of a semi thinned out condensed soup.","Remove from the heat and stir in spices and 1 1/2 cups of the cheeses, stirring to melt and combine.  Stir in another 1 1/2 cups of cheese, and stir until completely melted and smooth.","In a large mixing bowl, combine drained pasta with cheese sauce, stirring to combine fully. &nbsp;Pour half of the pasta mixture into the prepared baking dish. &nbsp;Top with 1 1/2 cups of grated cheeses, then top that with the remaining pasta mixture.","Sprinkle the top with the last 1 1/2 cups of cheese and bake for 15 minutes, until cheesy is bubbly and lightly golden brown. &nbsp;"]
// [{"name": "dried elbow pasta","amount": 1,"measurement": "pound","comment": null},{"name": "unsalted butter","amount": 0.5,"measurement": "cup","comment": null},{"name": "all purpose flour","amount": 0.5,"measurement": "cup","comment": null},{"name": "whole milk","amount": 1.5,"measurement": "cup","comment": null},{"name": "half and half","amount": 2.5,"measurement": "cup","comment": null},{"name": "grated medium sharp cheddar cheese ","amount": 4,"measurement": "cup","comment": "(divided (measured after grating))"},{"name": "grated Gruyere cheese ","amount": 2,"measurement": "cup","comment": "(divided (measured after grating))"},{"name": "salt","amount": 0.5,"measurement": "tablespoon","comment": null},{"name": "black pepper","amount": 0.5,"measurement": "teaspoon","comment": null},{"name": "paprika","amount": 0.25,"measurement": "teaspoon","comment": null}]