import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import * as express from "express";

const DEFAULT_PORT = 4040;
process.env.TZ = "Etc/Universal";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(express.json({ limit: "50mb" }));
  app.use(
    express.urlencoded({
      limit: "50mb",
      extended: true,
      parameterLimit: 50000,
    })
  );

  // if (process.env.NODE_ENV === 'local') {
  app.enableCors();
  // }

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle("CarRental-Backend")
    .setDescription("API for CarRental")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document, {
    customSiteTitle: "CarRental API",
  });

  await app.listen(process.env.PORT || DEFAULT_PORT);
}
bootstrap();
