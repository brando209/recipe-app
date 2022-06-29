function cleanString(string) {
    const htmlEntitiesRegex = /&(nbsp|lt|gt|amp|quot|apos|copy|reg|ndash|mdash|hellip|frac(?:12|13|14|15|16|17|18|23|25|34|35|38|45|56|58|78));/g;
    const htmlEntityConverstion = {
        '&nbsp;': " ",
        '&lt;': '<',
        '&gt;': '>',
        '&amp;': '&',
        '&quot;': '"',
        '&apos;': "'",
        '&copy;': '©',
        '&reg;': '®',
        '&ndash;': '-',
        '&mdash;': '-',
        '&hellip;': '…',
        '&frac12;': '1/2',
        '&frac13;': '1/3',
        '&frac14;': '1/4',
        '&frac15;': '1/5',
        '&frac16;': '1/6',
        '&frac17;': '1/7',
        '&frac18;': '1/8',
        '&frac23;': '2/3',
        '&frac25;': '2/5',
        '&frac34;': '3/4',
        '&frac35;': '3/5',
        '&frac38;': '3/8',
        '&frac45;': '4/5',
        '&frac56;': '5/6',
        '&frac58;': '5/8',
        '&frac78;': '7/8',
    };
    return string.replace(htmlEntitiesRegex, match => htmlEntityConverstion[match]);;
}

module.exports = { cleanString }