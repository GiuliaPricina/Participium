const request = require('supertest');

// Mock express so we can grab the server instance and close it later
jest.mock('express', () => {
    const realExpress = jest.requireActual('express');

    // function that builds the app and exposes server instance for tests
    const expressFn = (...args) => {
        const app = realExpress(...args);
        const realListen = app.listen.bind(app);
        app.listen = (port, cb) => {
            const server = realListen(port, cb);
            global.__TEST_SERVER__ = server;
            return server;
        };
        return app;
    };

    // copy commonly used express properties so express.json() etc. work
    Object.assign(expressFn, {
        json: realExpress.json,
        urlencoded: realExpress.urlencoded,
        Router: realExpress.Router,
        static: realExpress.static,
    });

    return expressFn;
});

describe('Reports API', () => {
    let agent;

    beforeAll(async () => {
        // --- MOCK dao.mjs to bypass the real database ---
        await jest.unstable_mockModule('../dao.mjs', () => {
            return {
                getAllApprovedReports: async () => ([
                    { report_id: 1, title: 'Approved Report 1', status_id: 2 },
                    { report_id: 2, title: 'Approved Report 2', status_id: 2 },
                ]),
                // Mock other dao functions used by the app to prevent import errors
                getUser: async (username, password) => null,
                getAllReports: async () => [],
                updateReportStatus: async (reportId, status_id, rejection_reason) => null,
                setOperatorByReport: async (reportId, operatorId) => null,
                getReportsAssigned: async (operatorId) => [],
                updateUserById: async (userId, updates) => null,
                createUser: async (username, email, first_name, last_name, email_notifications, password) => ({ id: 1 }),
                getAllOffices: async () => [],
                createMunicipalityUser: async (email, username, password, office_id, role_id) =>({ id: 1 }),
                getAllOperators: async () => [],
                getAllRoles: async () => [],
                getAllCategories: async () => [],
                insertReport: async (obj) =>({ report_id: 1 }),
                getTechnicalOfficersByOffice: async (office_id) => [],
                getUserInfoById: async (id) => null,

            };
        });

        // import the ESM index after mocks are ready
        await import('../index.mjs');

        agent = request.agent('http://localhost:3001');

        // small delay to ensure server listening
        await new Promise((r) => setTimeout(r, 100));
    });

    afterAll(async () => {
        jest.restoreAllMocks();
        if (global.__TEST_SERVER__ && typeof global.__TEST_SERVER__.close === 'function') {
            await new Promise((resolve) => global.__TEST_SERVER__.close(resolve));
            global.__TEST_SERVER__ = undefined;
        }
    });

    test('GET /api/reports/approved -> 200 with approved reports', async () => {
        const res = await agent.get('/api/reports/approved');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);
        expect(res.body[0]).toMatchObject({ title: 'Approved Report 1' });
    });
});
