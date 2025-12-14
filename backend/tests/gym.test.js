const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/database');

jest.mock('../src/config/database', () => ({
    query: jest.fn(),
}));

describe('Gym Endpoints', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/gyms', () => {
        it('should return all gyms', async () => {
            const mockGyms = [{ id: 1, name: 'Gold Gym' }];
            pool.query.mockResolvedValueOnce([mockGyms]);

            const res = await request(app).get('/api/gyms');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0]).toHaveProperty('name', 'Gold Gym');
        });
    });

    describe('POST /api/gyms', () => {
        it('should create a new gym', async () => {
            pool.query.mockResolvedValueOnce([{ insertId: 1 }]);

            const res = await request(app)
                .post('/api/gyms')
                .send({
                    name: 'New Gym',
                    address: '123 Street',
                    phone: '555-5555'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('gymId', 1);
        });
    });
});
