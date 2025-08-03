import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env'), debug: false });

async function setupTestDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  // Connect to the database without SSL since Zeabur doesn't support it
  const client = new Client({
    connectionString: databaseUrl,
    ssl: false,
  });

  const testSchemaName = 'test_schema';

  try {
    await client.connect();
    console.log('Connected to database');

    // Check if test schema exists
    const schemaExistsQuery = `
      SELECT EXISTS(
        SELECT schema_name FROM information_schema.schemata 
        WHERE schema_name = $1
      );
    `;
    
    const result = await client.query(schemaExistsQuery, [testSchemaName]);
    const schemaExists = result.rows[0].exists;

    if (!schemaExists) {
      console.log(`Creating test schema: ${testSchemaName}`);
      await client.query(`CREATE SCHEMA "${testSchemaName}"`);
      console.log('Test schema created successfully');
    } else {
      console.log('Test schema already exists');
    }

  } catch (error) {
    console.error('Error setting up test schema:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run if called directly
if (require.main === module) {
  setupTestDatabase()
    .then(() => {
      console.log('Test schema setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test database setup failed:', error);
      process.exit(1);
    });
}

export { setupTestDatabase };