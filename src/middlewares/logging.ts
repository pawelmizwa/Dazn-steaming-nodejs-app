import { NextFunction, Request, Response } from "express";
import logger from "general/utils/logger";
import { v4 as uuid } from "uuid";
import * as core from "express-serve-static-core";
import { AppConfig, Environment } from "general/setup/config";
import useragent from "useragent";

let run = 0;
const LOGGED_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

function shouldLog(req: Request) {
  const shoulLogByMethod = LOGGED_METHODS.includes(req.method.toUpperCase());
  return shoulLogByMethod;
}

function getRequestLogDetails(req: Request, environment: Environment) {
  let logDetails = {};
  if (environment !== Environment.local) {
    const agent = useragent.parse(req.headers["user-agent"]);
    logDetails = { run, agent: agent.toString() };
  }
  return logDetails;
}

export function requestLoggingMiddleware(appConfig: AppConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    const traceId = uuid();
    (req as LogRequest).traceId = traceId;
    ++run;
    if (shouldLog(req)) {
      logger.info(`REQUEST [${req.method}] ${req.originalUrl}`, {
        ...getRequestLogDetails(req, appConfig.environment),
        traceId,
      });

      res.on("finish", () => {
        logger.info(`RESPONSE [${req.method}] ${req.originalUrl} ${res.statusCode}`, {
          ...getRequestLogDetails(req, appConfig.environment),
          traceId,
        });
      });
    }
    next();
  };
}

export type LogRequest<
  P extends core.Params = core.ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = core.Query
> = Request<P, ResBody, ReqBody, ReqQuery> & {
  traceId: string;
};
