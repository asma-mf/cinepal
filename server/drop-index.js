require('dotenv').config();
const mongoose = require('mongoose');

const dropIndex = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected. Dropping index expiresAt_1...');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'bookings' }).toArray();
    if (collections.length > 0) {
      try {
        await db.collection('bookings').dropIndex('expiresAt_1');
        console.log('Successfully dropped index expiresAt_1');
      } catch (err) {
        if (err.codeName === 'IndexNotFound') {
          console.log('Index expiresAt_1 does not exist, skipping.');
        } else {
          console.error('Failed to drop index:', err);
        }
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

dropIndex();
