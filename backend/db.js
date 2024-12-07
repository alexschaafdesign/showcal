// db.js
import pkg from 'pg'; // Import the entire pg module
const { Pool } = pkg; // Destructure Pool from the module

const pool = new Pool({
    user: 'aschaaf',
    host: 'localhost',
    database: 'tcup_db',
    password: 'notthesame', // replace with your actual password
    port: 5432,
});

export default pool; // Export the pool instance