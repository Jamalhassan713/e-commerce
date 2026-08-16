import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LogggerMiddleware } from './common';
import { AdminModule, AuthModule, BrandModule, CategoryModule, GlobalModule, ProductModule, SocketModule, UsersModule } from './common/modules';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    AuthModule,
    GlobalModule,
    UsersModule,
    MongooseModule.forRoot(process.env.DB_URL as string),
    EventEmitterModule.forRoot(),
    AdminModule,
    SocketModule,
    BrandModule,
    CategoryModule,
    ProductModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogggerMiddleware).forRoutes('*')
  }
}
