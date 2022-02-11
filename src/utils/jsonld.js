const jsonld = require('jsonld');

const extractRecipeJsonld = async (root) => {
    const jsonldNodes = root.querySelectorAll('script[type="application/ld+json"]');

    let recipeNode = null;
    for(let node of jsonldNodes) {
        const jsonldData = JSON.parse(node.innerText);
        const compacted = await jsonld.compact(jsonldData, 'https://schema.org/');

        if(compacted.type === "Recipe") {
            recipeNode = compacted;
            break;
        }

        if(compacted["@graph"]) {
            recipeNode = compacted["@graph"].find(subnode => subnode.type === "Recipe");
            if(recipeNode) break;
        }
    }

    return recipeNode;
}

module.exports = { extractRecipeJsonld }