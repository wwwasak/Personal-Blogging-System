const SQL = require('sql-template-strings');
const { getDatabase } = require('../db/database.js');

async function createTestData(testData) {
    const db = await getDatabase();

    const result = await db.run(SQL`
        insert into test (stuff) values(${testData.stuff})`);

    testData.id = result.lastID;
}

async function retrieveTestDataById(id) {
    const db = await getDatabase();

    const testData = await db.get(SQL`
        select * from test
        where id = ${id}`);

    return testData;
}

async function retrieveAllTestData() {
    const db = await getDatabase();

    const allTestData = await db.all(SQL`select * from test`);

    return allTestData;
}

async function updateTestData(testData) {
    const db = await getDatabase();

    return await db.run(SQL`
        update test
        set stuff = ${testData.stuff}
        where id = ${testData.id}`);
}

async function deleteTestData(id) {
    const db = await getDatabase();

    return await db.run(SQL`
        delete from test
        where id = ${id}`);
}

// Export functions.
module.exports = {
    createTestData,
    retrieveTestDataById,
    retrieveAllTestData,
    updateTestData,
    deleteTestData,
};
