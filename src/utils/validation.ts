import { ValidatorOptions, validate } from "class-validator";
import { ClassType } from "class-transformer/ClassTransformer";
import { plainToClass } from "class-transformer";

import { HttpErrorResponse, TransformError } from "./errors";
import logger from "./logger";

const defaultValidatorOptions = { whitelist: true, groups: undefined };

export async function transformToClass<T extends object>(
  classType: ClassType<T>,
  plain: T,
  options: ValidatorOptions = defaultValidatorOptions
): Promise<T> {
  try {
    const obj = plainToClass<T, T>(classType, plain);

    const errors = await validate(obj, {
      ...options,
      validationError: { target: false, value: false },
    });
    if (errors.length > 0) {
      throw new TransformError(`TransformError: ${classType.name}`, errors);
    }
    return obj;
  } catch (e) {
    logger.error("Transform error", { error: e });
    throw e;
  }
}
function transformToClassUnsafe<T extends object>(
  classType: ClassType<T>,
  plain: object,
  options: ValidatorOptions = defaultValidatorOptions
): Promise<T> {
  return transformToClass<T>(classType, plain as T, options);
}

function trimStrings(obj: object) {
  const result: { [k: string]: unknown } = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = value.trim();
    } else {
      result[key] = value;
    }
  }

  return result;
}

export async function transformToRequest<T extends object>(
  classType: ClassType<T>,
  plain: object,
  options: ValidatorOptions = defaultValidatorOptions
): Promise<T> {
  try {
    const processed = trimStrings(plain);
    return await transformToClassUnsafe<T>(classType, processed, options);
  } catch (err) {
    throw new HttpErrorResponse(400, err);
  }
}
