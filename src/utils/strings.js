const convertUnicodeFraction = (string) => {
    const unicodeFractionRegex = /[\u00BC-\u00BE\u2150-\u215E]/
    const unicodeFraction = string.match(unicodeFractionRegex);

    if(unicodeFraction) {
        const unicode = unicodeFraction[0];
        const normalized = unicode.normalize('NFKC').replace('⁄', '/'); //TODO: Account for all characters slash-like
        const updatedString = string.replace(unicode, normalized).replace(' ', " "); //TODO: Account for all charachers space-like
        return updatedString;
    }
    return string;
}

module.exports = { convertUnicodeFraction }