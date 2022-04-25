CREATE TABLE users(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(32) NOT NULL,
    lastName VARCHAR(32) NOT NULL,
    userName VARCHAR(32) NOT NULL,
    email    VARCHAR(64) NOT NULL,
    password VARCHAR(64) NOT NULL,
    theme ENUM('light', 'dark', 'red', 'pink', 'blue', 'purple') DEFAULT 'light',
    type ENUM ('user', 'guest') DEFAULT 'user';
);

CREATE TABLE guests(
    id INT NOT NULL,
    loginAt DATETIME DEFAULT NULL,

    FOREIGN KEY (id) REFERENCES users(id)
);

CREATE TABLE recipes(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(96) NOT NULL,
    instructions TEXT NOT NULL,
    description TEXT,
    serves INT NOT NULL,
    prepTime VARCHAR(32) NOT NULL DEFAULT "PT0S",
    cookTime VARCHAR(32) NOT NULL DEFAULT "PT0S",
    totalTime VARCHAR(32) NOT NULL DEFAULT "PT0S",
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

CREATE TABLE lists(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE list_item(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    list_id INT NOT NULL,

    name VARCHAR(255) NOT NULL,
    complete TINYINT NOT NULL DEFAULT 0,

    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
);

CREATE TABLE meal_plans(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE meal_plan_item(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,

    recipe_id INT NOT NULL,
    date DATETIME NOT NULL,

    FOREIGN KEY (plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);