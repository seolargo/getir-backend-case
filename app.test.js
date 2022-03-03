const app = require('./app');
const supertest = require('supertest');
const request = supertest(app);

describe('POST /filterRecords', () => {

    it('should return 1 if there are no results that are returned with given parameters', async (done) => {
        //const mockFile = mockFile2;
        //expect(filter(mockFile, '2016-01-26', "2018-02-02", 2700, 3000)).toStrictEqual(result);
        
        const response = await request.post('/filterRecords')
            .send({
                startDate: "2016-01-26",
                endDate: "2018-02-02",
                minCount: 2700,
                maxCount: 3000
            });
            expect(response.statusCode).toBe(200);
            done();
    });

});