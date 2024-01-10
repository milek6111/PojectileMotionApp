const { Pool } = require('pg');

const pool = new Pool({
    user: 'rzmersdd',
    database: 'rzmersdd',
    host: 'tai.db.elephantsql.com',
    port: 5432,
    password: 'V2euyNZgwTplSANTEgO6TPQsPcM2A4ve'

});

module.exports = pool;