const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Room = require('../models/Room');
const Trainee = require('../models/Trainee');
const Inventory = require('../models/Inventory');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Migration function
async function migrateExistingData() {
  try {
    console.log('Starting data migration...');

    // Get the first admin user (or create one if none exists)
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('No admin user found, creating default admin...');
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@hostel.com',
        password: 'admin123',
        fullName: 'System Administrator',
        role: 'admin'
      });
      console.log('Created default admin user');
    }

    // Update all existing rooms to belong to admin user
    const roomsUpdated = await Room.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: adminUser._id } }
    );
    console.log(`Updated ${roomsUpdated.modifiedCount} rooms with userId`);

    // Update all existing trainees to belong to admin user
    const traineesUpdated = await Trainee.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: adminUser._id } }
    );
    console.log(`Updated ${traineesUpdated.modifiedCount} trainees with userId`);

    // Update all existing inventory items to belong to admin user
    const inventoryUpdated = await Inventory.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: adminUser._id } }
    );
    console.log(`Updated ${inventoryUpdated.modifiedCount} inventory items with userId`);

    console.log('Data migration completed successfully!');
    console.log(`All existing data now belongs to admin user: ${adminUser.username}`);

  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run migration
migrateExistingData();