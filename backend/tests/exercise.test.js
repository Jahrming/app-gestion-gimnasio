const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/database');

jest.mock('../src/config/database', () => ({
    query: jest.fn(),
}));

describe('Exercise Endpoints', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/exercises', () => {
        it('should return all exercises', async () => {
            const mockExercises = [{ id: 1, name: 'Bench Press' }];
            pool.query.mockResolvedValueOnce([mockExercises]);

            const res = await request(app).get('/api/exercises');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0]).toHaveProperty('name', 'Bench Press');
        });
    });

    describe('POST /api/exercises', () => {
        it('should create a new exercise', async () => {
            pool.query.mockResolvedValueOnce([{ insertId: 1 }]);

            const res = await request(app)
                .post('/api/exercises')
                .send({
                    name: 'Squat',
                    description: 'Leg exercise',
                    muscle_group: 'legs',
                    equipment_needed: 'barbell'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('exerciseId', 1);
        });
    });
});
