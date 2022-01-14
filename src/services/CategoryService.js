const Table = require('../database/Table');

const Category = new Table('categories');

function CategoryService() { }

CategoryService.prototype.getCategories = async function () {
    const categories = await Category.getEntries();
    return categories;    
}

CategoryService.prototype.deleteIngredient = function (categoryId) {
    return Category.removeEntries({ id: categoryId });
}

module.exports = CategoryService;