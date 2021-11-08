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
);