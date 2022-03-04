const app = require('./app');
const supertest = require('supertest');
const request = supertest(app);

const missingCounts = require('./missing-counts.json');
const countsNotArray = require('./counts-not-array.json');

jest.setTimeout(60000);

describe('POST /filterrecords', () => {

    it('should return status 200 if the given parameters are correct', async () => {
        const response = await request.post('/filterrecords')
            .send({
                "startDate": "2016-01-26",
                "endDate": "2018-02-02",
                "minCount": 2700,
                "maxCount": 3000
            });
            expect(response.statusCode).toBe(200);
    });

    it('should return status 200 if the given parameters are correct but result set is empty', async () => {
        const response = await request.post('/filterrecords')
            .send({
                "startDate": "2016-01-26",
                "endDate": "2018-02-02",
                "minCount": 0,
                "maxCount": 0
            });
            expect(response.statusCode).toBe(200);
    });

    it('should return status 500 if the counts parameter is null', async () => {
        function calculate(val, startDate, endDate, minCount, maxCount) {
            const records = [];                
            const calculateTotalCount = () => {
                if (!val['counts']) {
                    throw new Error('db-error');
                }
    
                const countsArray = Object.values(val['counts']);
                if (!Array.isArray(countsArray)) {
                    throw new Error('db-error');
                }
        
                let totalCount = 0;
                countsArray.forEach(value => { totalCount = totalCount + value; });
        
                return totalCount;
            }
            const totalCount = calculateTotalCount();
        
            const createdAt = val['createdAt'];
            if (!createdAt) {
                throw new Error('db-error');
            }
            const recordDate = new Date(createdAt).toISOString().split('T')[0];
            const recordDateInTime = new Date(recordDate).getTime();
        
            const startDateInTime = new Date(startDate).getTime();
            const endDateInTime = new Date(endDate).getTime();
        
            const countRequirementSatisfied = totalCount >= minCount && totalCount <= maxCount;
            const dateRequirementSatisfied = recordDateInTime > startDateInTime && recordDateInTime < endDateInTime;
            if (countRequirementSatisfied && dateRequirementSatisfied) {
                records.push({ 
                    'key': val.key,
                    'createdAt': val.createdAt,
                    'totalCount': totalCount
                });
            }
        }
        expect(() => calculate(missingCounts, "2016-01-26", "2018-02-02", 0, 0)).toThrow('db-error');
    });

    it('should return status 500 if the counts parameter is not array', async () => {
        function calculate(val, startDate, endDate, minCount, maxCount) {
            const records = [];                
            const calculateTotalCount = () => {
                if (!val['counts']) {
                    throw new Error('db-error');
                }
    
                const countsArray = Object.values(val['counts']);
                if (!Array.isArray(countsArray)) {
                    throw new Error('db-error');
                }
        
                let totalCount = 0;
                countsArray.forEach(value => { totalCount = totalCount + value; });
        
                return totalCount;
            }
            const totalCount = calculateTotalCount();
        
            const createdAt = val['createdAt'];
            if (!createdAt) {
                throw new Error('db-error');
            }
            const recordDate = new Date(createdAt).toISOString().split('T')[0];
            const recordDateInTime = new Date(recordDate).getTime();
        
            const startDateInTime = new Date(startDate).getTime();
            const endDateInTime = new Date(endDate).getTime();
        
            const countRequirementSatisfied = totalCount >= minCount && totalCount <= maxCount;
            const dateRequirementSatisfied = recordDateInTime > startDateInTime && recordDateInTime < endDateInTime;
            if (countRequirementSatisfied && dateRequirementSatisfied) {
                records.push({ 
                    'key': val.key,
                    'createdAt': val.createdAt,
                    'totalCount': totalCount
                });
            }
        }
        expect(() => calculate(countsNotArray, "2016-01-26", "2018-02-02", 0, 0)).toThrow('db-error');
    });
});