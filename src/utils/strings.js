function cleanString(string) {
    const htmlEntitiesRegex = /&(nbsp|lt|gt|amp|quot|apos|copy|reg);/g;
    const htmlEntityConverstion = {
        '&nbsp;': " ",
        '&lt;': '<',
        '&gt;': '>',
        '&amp;': '&',
        '&quot;': '"',
        '&apos;': "'",
        '&copy;': '©',
        '&reg;': '®',
    };
    return string.replace(htmlEntitiesRegex, match => htmlEntityConverstion[match]);;
}

module.exports = { cleanString }