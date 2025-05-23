import { connectToDatabase, startExpress } from "..";
import { Express } from "express";

export let app: Express;

beforeAll(async () => {
  await connectToDatabase();
  app = await startExpress();
});
