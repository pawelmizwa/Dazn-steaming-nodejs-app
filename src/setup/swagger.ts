import { Controller, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { ApiForbiddenResponse, DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import swaggerUi from "swagger-ui-express";
import express, { Router } from "express";
import { Type } from "@nestjs/common/interfaces/type.interface";

@Controller()
@ApiForbiddenResponse()
export class ApiBaseController {}

export const addSwaggerDocs = async function (router: Router, controllers: Type<any>[]) {
  @Module({
    controllers: controllers,
  })
  class AppModule {}

  const docsApp = await NestFactory.create(AppModule, new ExpressAdapter(router));
  const config = new DocumentBuilder()
    .setTitle("Recruitment Task API")
    .setDescription("")
    .setVersion("1.0")
    .build();

  const document = SwaggerModule.createDocument(docsApp, config);

  router.use("/api-docs", express.static("static-swagger"));
  router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(document));
};
