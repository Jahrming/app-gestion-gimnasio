const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/database');

// Mock the database pool
jest.mock('../src/config/database', () => ({
    query: jest.fn(),
}));

describe('Auth Endpoints', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            // Mock finding no existing user
            pool.query.mockResolvedValueOnce([[]]);
            // Mock successful insertion
            pool.query.mockResolvedValueOnce([{ insertId: 1 }]);

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                    first_name: 'Test',
                    last_name: 'User'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'User registered successfully');
            expect(res.body).toHaveProperty('userId', 1);
        });

        it('should return 409 if user already exists', async () => {
            // Mock finding existing user
            pool.query.mockResolvedValueOnce([[{ id: 1, email: 'test@example.com' }]]);

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(409);
            expect(res.body).toHaveProperty('message', 'User already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully with correct credentials', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                password_hash: 'password123',
                first_name: 'Test',
                role_id: 4
            };

            // Mock finding user
            pool.query.mockResolvedValueOnce([[mockUser]]);

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Login successful');
            expect(res.body.user).toHaveProperty('email', 'test@example.com');
        });

        it('should return 401 for invalid credentials', async () => {
            // Mock finding user
            pool.query.mockResolvedValueOnce([[{
                id: 1,
                email: 'test@example.com',
                password_hash: 'password123'
            }]]);

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('message', 'Invalid credentials');
        });
    });
});
