import { createTestDocs, getTestController } from "general/controllers/test";
import { wrap } from "general/utils/express";
import logger from "general/utils/logger";
import { RequestHandler, Router } from "express";
import { AppConfig } from "./config";
import { addSwaggerDocs } from "./swagger";
import { getVideoController } from "general/controllers/video";
import { DbClient } from "general/clients/mongodb";

export type BuildRouterArgs = {
  appConfig: AppConfig;
};

export async function addApiRoutes(router: Router, appConfig: AppConfig, dbClient: DbClient) {
  logger.debug("Building app router", { appConfig });

  const publicGet = (path: string, handler: RequestHandler, createDocs: Function): any => {
    router.get(path, wrap(handler));
    return createDocs(path);
  };

  const testDocs = publicGet("/test", getTestController(dbClient), createTestDocs);
  const videoDocs = publicGet("/video", getVideoController(), createTestDocs);

  await addSwaggerDocs(router, [testDocs, videoDocs]);
}
