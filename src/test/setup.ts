import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import settings from "../config/settings";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  // Create in-memory MongoDB instance for testing
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections: any = await mongoose.connection?.db?.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  // Clean up after tests
  await mongoose.connection.close();
  await mongo.stop();
});

// Test helper functions
export const createTestUser = async () => {
  // Implementation for creating test user
};

export const generateTestToken = (userId: string) => {
  // Implementation for generating test JWT
};

export const setupTestData = async () => {
  // Implementation for setting up test data
};
