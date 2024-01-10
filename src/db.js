const { Pool } = require('pg');

const pool = new Pool({
    // user: 'u1trzop',
    // host: 'pascal.fis.agh.edu.pl',
    // database: 'u1trzop',
    // password: 'qywter162534',
    // port: 5432

    user: 'rzmersdd',
    database: 'rzmersdd',
    host: 'tai.db.elephantsql.com',
    port: 5432,
    password: 'V2euyNZgwTplSANTEgO6TPQsPcM2A4ve'

});

module.exports = pool;