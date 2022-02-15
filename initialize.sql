CREATE TABLE users(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(32) NOT NULL,
    lastName VARCHAR(32) NOT NULL,
    userName VARCHAR(32) NOT NULL,
    email    VARCHAR(64) NOT NULL,
    password VARCHAR(64) NOT NULL
);

CREATE TABLE recipes(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(96) NOT NULL,
    instructions TEXT NOT NULL,
    description TEXT,
    serves INT NOT NULL,
    prepTime INT NOT NULL,
    prepUnit ENUM('min', 'hr') DEFAULT 'min',
    cookTime INT NOT NULL,
    cookUnit ENUM('min', 'hr') DEFAULT 'min',
    comments TEXT
);

CREATE TABLE user_recipe(
    user_id INT NOT NULL,
    recipe_id INT NOT NULL,
    favorite TINYINT NOT NULL DEFAULT 0,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE TABLE ingredients(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
    name VARCHAR(96) NOT NULL
);

CREATE TABLE recipe_ingredient(
    recipe_id INT NOT NULL,
    ingredient_id INT NOT NULL,

    quantity DECIMAL(5,3),
    unit ENUM(
        'teaspoon', 'tablespoon', 'cup',
        'ounce', 'pound', 'milligram', 'gram', 'kilogram',
        'liter', 'milliliter', 'quart', 'pint', 'gallon',
        'pinch', 'piece',
        'slice', 'stick', 'clove',
        'can', 'box', 'bag', 'package', 'bunch'
    ),
    size ENUM('small', 'medium', 'large'),
    comment VARCHAR(255) DEFAULT NULL,

    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
);

CREATE TABLE categories(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(32) NOT NULL,
    type ENUM('cuisine', 'flavor', 'dish', 'meal', 'other') default 'other'
);

CREATE TABLE recipe_category(
    recipe_id INT NOT NULL,
    category_id INT NOT NULL,

    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE photos(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    path VARCHAR(255) NOT NULL,
    mimetype VARCHAR(32),
    recipeId INT NOT NULL,

    FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE 
);