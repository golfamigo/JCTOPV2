import { setupTestDatabase } from './scripts/setup-test-db';

// Global test setup - runs before all tests
beforeAll(async () => {
  try {
    await setupTestDatabase();
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
}, 60000); // 60 second timeout for database setup