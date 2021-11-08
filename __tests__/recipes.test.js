const request = require("supertest");
const app = require("../app");

const Database = require('../src/database/Database');
const db = new Database();

const recipeApiBaseUrl = '/api/recipes';
const recipes = [
    {
        title: "Mac and Cheese",
        description: "A very basic mac and cheese dish",
        serves: 4,
        prep: { time: 5, unit: "min" },
        cook: { time: 10, unit: "min" },
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

describe("POST /recipes", () => {
    test("Response should be a new recipe", async () => {
        const response = await request(app).post(recipeApiBaseUrl).send(recipes[0]);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            id: response.body.id,
            title: 'Mac and Cheese',
            instructions: 'Bring water to boil.|Boil macaroni for 10 minutes then strain and return to pot.|Add milk, cheese, and butter. Give it a stir.',
            description: 'A very basic mac and cheese dish',
            serves: 4,
            prepTime: 5,
            prepUnit: 'min',
            cookTime: 10,
            cookUnit: 'min',
            comments: 'This recipe is cheesy.|You can also make this from a box of Kraft Mac N Cheese.'
        });
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

