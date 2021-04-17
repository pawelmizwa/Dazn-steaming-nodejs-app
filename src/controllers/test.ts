import { Get } from "@nestjs/common";
import { ApiForbiddenResponse, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ApiBaseController } from "general/setup/swagger";
import { Response, Request } from "express";
import { DbClient } from "general/clients/mongodb";
import { v4 as uuid } from "uuid";

export function getTestController(dbClient: DbClient) {
  return async (_req: Request, res: Response) => {
    dbClient.addUser({ userId: uuid(), email: "test.test@test.com", password: "1234" });
    return res.status(200).send({ test: { ok: true } });
  };
}

export const createTestDocs = (path: string) => {
  class TestController extends ApiBaseController {
    @Get(path)
    @ApiOperation({ summary: "testDocs" })
    @ApiResponse({
      status: 200,
      description: "Test API Connection",
    })
    @ApiForbiddenResponse({ description: "not allowed" })
    handler() {}
  }
  return TestController;
};
