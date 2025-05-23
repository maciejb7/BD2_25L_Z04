import { connectToDatabase, initializeExpress } from "..";

export default async () => {
  await connectToDatabase();
};

export const getApp = async () => {
  return await initializeExpress();
};
