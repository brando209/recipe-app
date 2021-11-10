const request = require("supertest");
const app = require("../../../app");

const Database = require('../../database/Database');
const db = new Database();

const recipeApiBaseUrl = '/api/recipes';
const recipes = [
    {
        title: "Mac and Cheese",
        description: "A very basic mac and cheese dish",
        serves: 4,
        prep: { time: 5, unit: "min" },
        cook: { time: 10, unit: "min" },
        ingredients: [
            { name: "elbow macaroni", amount: 6, measurement: "ounce" },
            { name: "butter", amount: 0.25, measurement: "cup" },
            { name: "milk", amount: 0.25, measurement: "cup" },
            { name: "shredded cheese", amount: 1, measurement: "cup" }
        ],
        instructions: [
            "Bring water to boil.",
            "Boil macaroni for 10 minutes then strain and return to pot.",
            "Add milk, cheese, and butter. Give it a stir."
        ],
        comments: [
            "This recipe is cheesy.",
            "You can also make this from a box of Kraft Mac N Cheese."
        ]
    }
]

beforeAll(async () => {
    db.openConnection();
    await db.delete("recipes", "*");
})

afterEach(async () => {
    await db.delete("recipes", "*");
});

afterAll(() => {
    db.closeConnection();
})

describe("POST /recipes", () => {
    test("Response should be a new recipe", async () => {
        const response = await request(app).post(recipeApiBaseUrl).send(recipes[0]);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('title', recipes[0].title);
        expect(response.body).toHaveProperty('instructions');
        expect(response.body.instructions).toHaveLength(3);
        expect(response.body).toHaveProperty('description', recipes[0].description);
        expect(response.body).toHaveProperty('serves', recipes[0].serves);
        expect(response.body).toHaveProperty('ingredients');
        expect(response.body.ingredients).toHaveProperty('milk');
        expect(response.body.ingredients.milk).toHaveProperty('amount');
        expect(response.body.ingredients.milk).toHaveProperty('measurement');
        expect(response.body.ingredients.milk).toHaveProperty('size');
        expect(response.body.ingredients).toHaveProperty('elbow macaroni');
        expect(response.body.ingredients).toHaveProperty('butter');
        expect(response.body.ingredients).toHaveProperty('shredded cheese');
    });
});

describe("GET /recipes", () => {
    beforeAll(async () => {
        await request(app).post(recipeApiBaseUrl).send(recipes[0]);
        await request(app).post(recipeApiBaseUrl).send(recipes[0]);
        await request(app).post(recipeApiBaseUrl).send(recipes[0]);
    });

    afterEach(async () => {
        await db.delete("recipes", "*");
    })

    test("Response should be an array of 3 recipes", async () => {
        const response = await request(app).get(recipeApiBaseUrl);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(3);
    });

    test("Response should be a single recipe", async () => {
        const postResponse = await request(app).post(recipeApiBaseUrl).send(recipes[0]);

        const getResponse = await request(app).get(`${recipeApiBaseUrl}/${postResponse.body.id}`);
        expect(getResponse.statusCode).toBe(200);
    });

    test("Response should be 404 Not Found", async () => {
        const response = await request(app).get(`${recipeApiBaseUrl}/44`);
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({});
        expect(response.text).toBe("Recipe not found!");
    });
});

describe("DELETE /recipes/:recipeId", () => {
    test("Create a recipe and then delete it", async () => {
        const postResponse = await request(app).post(recipeApiBaseUrl).send(recipes[0]);

        const deleteResponse = await request(app).delete(`${recipeApiBaseUrl}/${postResponse.body.id}`);
        expect(deleteResponse.statusCode).toBe(200);
        expect(deleteResponse.text).toBe("Recipe Deleted!");

        const getResponse = await request(app).get(`${recipeApiBaseUrl}/${postResponse.body.id}`);
        expect(getResponse.statusCode).toBe(404);
        expect(getResponse.text).toBe("Recipe not found!");
    });
});

describe("PATCH /recipes/:recipeId", () => {
    test("Create a recipe and then update it", async () => {
        const postResponse = await request(app).post(recipeApiBaseUrl).send(recipes[0]);

        const patchResponse = await request(app).patch(`${recipeApiBaseUrl}/${postResponse.body.id}`).send({title: "Updated title"});
        expect(patchResponse.statusCode).toBe(200);
        expect(patchResponse.text).toBe("Recipe Updated!");

        const getResponse = await request(app).get(`${recipeApiBaseUrl}/${postResponse.body.id}`);
        expect(getResponse.statusCode).toBe(200);
        expect(getResponse.body.title).toBe("Updated title");
    });
});

