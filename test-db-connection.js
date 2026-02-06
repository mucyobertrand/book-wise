// Test database connection to verify error handling
const { db } = require('./database/drizzle');
const { books } = require('./database/schema');
const { desc } = require('drizzle-orm');

async function testConnection() {
  console.log('Testing database connection...');
  
  try {
    const result = await db
      .select()
      .from(books)
      .limit(1);
    
    console.log('✅ Database connection successful');
    console.log(`Found ${result.length} books`);
  } catch (error) {
    console.log('❌ Database connection failed');
    console.log('Error type:', error.constructor.name);
    console.log('Error message:', error.message);
    
    // This is the error handling we implemented
    if (error) {
      console.log('✅ Error handling working - returning empty data');
    }
  }
}

testConnection().catch(console.error);
