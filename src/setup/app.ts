import express, { Express, NextFunction, Response, Router, Request } from "express";
import helmet from "helmet";
import cors from "cors";
import bodyParser from "body-parser";
import logger from "general/utils/logger";
import { AppConfig, readAppConfig } from "general/setup/config";
import cookieParser from "cookie-parser";
import { requestLoggingMiddleware } from "general/middlewares/logging";
import { createDbClient, DbClient } from "general/clients/mongodb";
import { authenticateUser } from "general/middlewares/auth";
import cookieSession from "cookie-session";

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
  app.set("view engine", "ejs");
  app.use(express.static("public"));
  app.use(cookieParser());
  app.use(
    cookieSession({
      keys: ["random"],
    })
  );
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(requestLoggingMiddleware(appConfig));
  return app;
}

export async function initApp() {
  const appConfig = await readAppConfig();
  const dbClient = await createDbClient(appConfig);
  const app = await createAppBase(appConfig);
  return {
    app,
    appConfig,
    dbClient,
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
  applyRoutes: (router: Router, appConfig: AppConfig, dbClient: DbClient) => void
) => {
  logger.info(`${functionName} app creating`);
  const { app, appConfig, dbClient } = await initApp();
  const router = Router();
  app
    .get("/", (_req, res) => {
      res.render("index");
    })
    .get("/login", (_req, res) => {
      res.render("login");
    })
    .get("/register", (_req, res) => {
      res.render("register");
    })
    .get("/home", authenticateUser, (req, res) => {
      res.render("home", { user: req.session?.user });
    })
    .get("/logout", authenticateUser, (req, res) => {
      req.session!.user = null;
      res.redirect("/login");
    });
  applyRoutes(router, appConfig, dbClient);
  app.use(appConfig.restPrefix, router);
  addErrorHandler(app);
  app.set("json spaces", 4);
  return app;
};
