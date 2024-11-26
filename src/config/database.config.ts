import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/your_database_name',
  options: {
    dbName: process.env.DATABASE_NAME || 'your_database_name',
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
    family: 4
  }
}));