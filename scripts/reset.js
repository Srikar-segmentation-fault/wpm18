const mongoose = require('mongoose');
(async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rentease';
    await mongoose.connect(uri);
    console.log('Connected to', uri);
    await mongoose.connection.dropDatabase();
    console.log('Dropped database');
    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
