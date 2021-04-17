import { createApp } from "general/setup/app";
import { addApiRoutes } from "general/setup/router";
import request from "supertest";

export type TestRequest = AsyncReturnType<typeof getTestRequest>;

export async function getTestRequest() {
  return request(await createApp("test server", addApiRoutes));
}

type AsyncReturnType<T extends (...args: any) => any> = T extends (...args: any) => Promise<infer U>
  ? U
  : T extends (...args: any) => infer U
  ? U
  : never;

export type TestResponse<B> = Omit<request.Response, "body"> & { body: B };
