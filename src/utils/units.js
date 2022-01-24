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