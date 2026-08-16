import "dotenv/config";
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { UnifiedResponseInterceptor } from "./common";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new UnifiedResponseInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(`Application is running on PORT ${process.env.PORT} `);
  });
}
bootstrap();

