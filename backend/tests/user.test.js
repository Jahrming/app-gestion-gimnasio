const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/database');

jest.mock('../src/config/database', () => ({
    query: jest.fn(),
}));

describe('User Endpoints', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/users', () => {
        it('should return all users', async () => {
            const mockUsers = [
                { id: 1, email: 'user1@example.com' },
                { id: 2, email: 'user2@example.com' }
            ];
            pool.query.mockResolvedValueOnce([mockUsers]);

            const res = await request(app).get('/api/users');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0]).toHaveProperty('email', 'user1@example.com');
        });
    });

    describe('GET /api/users/:id', () => {
        it('should return a user by id', async () => {
            const mockUser = { id: 1, email: 'user1@example.com' };
            pool.query.mockResolvedValueOnce([[mockUser]]);

            const res = await request(app).get('/api/users/1');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('email', 'user1@example.com');
        });

        it('should return 404 if user not found', async () => {
            pool.query.mockResolvedValueOnce([[]]);

            const res = await request(app).get('/api/users/999');

            expect(res.statusCode).toEqual(404);
        });
    });
});
