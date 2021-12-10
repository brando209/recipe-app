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
    title VARCHAR(32) NOT NULL,
    instructions TEXT NOT NULL,
    description TEXT,
    serves INT NOT NULL,
    prepTime INT NOT NULL,
    prepUnit ENUM('min', 'hr') DEFAULT 'min',
    cookTime INT NOT NULL,
    cookUnit ENUM('min', 'hr') DEFAULT 'min',
    comments TEXT
    photoId INT,

    FOREIGN KEY (photoId) REFERENCES files(id) ON DELETE CASCADE
);

CREATE TABLE user_recipe(
    user_id INT NOT NULL,
    recipe_id INT NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE TABLE ingredients(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
    name VARCHAR(32) NOT NULL
);

CREATE TABLE recipe_ingredient(
    recipe_id INT NOT NULL,
    ingredient_id INT NOT NULL,

    amount DECIMAL(5,3),
    measurement ENUM('teaspoon', 'tablespoon', 'cup', 'ounce', 'pound', 'gram'),
    size ENUM('small', 'medium', 'large'),

    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
);

CREATE TABLE files(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    path VARCHAR(255) NOT NULL,
    mimetype VARCHAR(32)
);