import { IsIn, IsString } from "class-validator";
import { createEnvReader } from "general/utils/env";
import { transformToClass } from "general/utils/validation";

export enum Environment {
  dev = "dev",
  local = "local",
  prod = "prod",
}

export async function readAppConfig(): Promise<AppConfig> {
  const envReader = createEnvReader(process.env);
  const { readRequiredString } = envReader;

  const environment = readRequiredString("ENVIRONMENT") as Environment;
  const restPrefix = readRequiredString("REST_PREFIX");

  return transformToClass(AppConfig, {
    environment,
    restPrefix,
  });
}

export class AppConfig {
  @IsString()
  @IsIn(Object.values(Environment))
  readonly environment: Environment;

  @IsString()
  readonly restPrefix: string;
}
