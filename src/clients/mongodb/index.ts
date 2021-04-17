import { AppConfig } from "general/setup/config";
import { HttpErrorResponse } from "general/utils/errors";
import logger from "general/utils/logger";
import { connect, connection } from "mongoose";

export type DbClient = ReturnType<typeof createDbClient>;

export function createDbClient(appConfig: AppConfig) {
  console.log(appConfig.mongoUri);
  connect(appConfig.mongoUri, { useNewUrlParser: true });
  const db = connection;
  db.on("error", function (error) {
    logger.error("MongoDb Error", { error });
    throw new HttpErrorResponse(500, { message: "MongoDb Error" });
  });
  db.once("open", function () {
    logger.info("Connected");
  });

  return Object.freeze({
    addUser({ userId, email, password }: { userId: string; email: string; password: string }) {
      logger.info("[DbClient].addUser", { userId, email });
      return db.collection("users").insertOne({ userId, email, password });
    },
    getUser({ email }: { email: string }) {
      logger.info("[DbClient].addUser", { email });
      return db.collection("users").findOne({ email });
    },
  });
}
