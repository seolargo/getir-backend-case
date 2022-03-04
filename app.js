const PORT = process.env.PORT || 3000;

const express = require("express");

const app = express();
app.use(express.json());

const MongoClient = require('mongodb').MongoClient;
const dbURI = 'mongodb+srv://challengeUser:WUMglwNBaydH8Yvu@challenge-xzwqd.mongodb.net/getir-case-study?retryWrites=true';

app.post("/filterrecords", function(req, res) {
    const startDate = req.body.startDate || '2014-01-01T00:00:00.921Z';
    const endDate = req.body.endDate || '2016-12-31T00:00:00.921Z';
    const minCount = req.body.minCount || 0;
    const maxCount = req.body.maxCount || 10000;

    const records = [];

    try {
        MongoClient.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(async (result) => {
                await result.db('getir-case-study').collection('records').find({})
                    .forEach(val => {
                        
                        const calculateTotalCount = () => {
                            const isValueTrue = val['counts'];
                            if (!isValueTrue) {
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
                    });

                const areRecordsFound = records.length > 0;
                if (areRecordsFound) {
                    res.status(200).send({
                        'code': 0,
                        'msg': 'Success',
                        'records': records
                    });
                } 
                else {
                    res.status(200).send({
                        'code': 1,
                        'msg': 'There are no records found for your given parameters',
                        'records': []
                    });
                }
            });
    } 
    catch (error) {
        if (error.error === 'db-error') {
            res.status(500).send({error: 'Some problems occurred in database'});
        } else {
            res.status(500).send({error: 'Internal error'})
        }
    }
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, function() {
        console.log(`Listening on Port ${PORT}`);
    });
}

module.exports = app;