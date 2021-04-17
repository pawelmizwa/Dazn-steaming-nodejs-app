import express, { Express, NextFunction, Request, Response, Router } from "express";
import helmet from "helmet";
import cors from "cors";
import bodyParser from "body-parser";
import logger from "general/utils/logger";
import { AppConfig, readAppConfig } from "general/setup/config";
import cookieParser from "cookie-parser";
import { requestLoggingMiddleware } from "general/middlewares/logging";

const CORS_OPTIONS = {
  origin: [/http:\/\/localhost\:\d+/],
  optionsSuccessStatus: 200,
  credentials: true,
};

export type HttpException = {
  status?: number;
  statusCode?: number;
  message: string;
  stack: any;
  details?: object;
};

async function createAppBase(appConfig: AppConfig) {
  logger.debug("Building app");
  const app = express();
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`],
          imgSrc: [`'self'`, "data:", "validator.swagger.io"],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
        },
      },
    })
  );
  app.use(cors(CORS_OPTIONS));
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(requestLoggingMiddleware(appConfig));
  return app;
}

export async function initApp() {
  const appConfig = await readAppConfig();
  const app = await createAppBase(appConfig);
  return {
    app,
    appConfig,
  };
}

export function addErrorHandler(app: Express) {
  const jsonErrorHandler = (
    error: HttpException,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const statusCode = error.statusCode || error.status || 500;
    error.details = {
      params: req.params,
      query: req.query,
      body: req.body,
      headers: req.rawHeaders,
    };
    logger.error(`Error occurred with status: ${statusCode} for request: ${req.path}`, error);
    res.status(statusCode).json({ message: error.message, stack: error.stack });
  };
  app.use(jsonErrorHandler);
}

export const createApp = async (
  functionName: string,
  applyRoutes: (router: Router, appConfig: AppConfig) => void
) => {
  logger.info(`${functionName} app creating`);
  const { app, appConfig } = await initApp();
  const router = Router();
  router.get("/", (_req: Request, res: Response) => {
    res.sendFile(__dirname + "/index.html");
  });
  applyRoutes(router, appConfig);
  app.use(appConfig.restPrefix, router);
  addErrorHandler(app);
  app.set("json spaces", 4);
  return app;
};
