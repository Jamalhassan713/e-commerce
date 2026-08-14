import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LogggerMiddleware, SocketModule } from './common';
import { GlobalModule } from './common/modules';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    AuthModule,
    GlobalModule,
    UsersModule,
    MongooseModule.forRoot(process.env.DB_URL as string),
    EventEmitterModule.forRoot(),
    AdminModule,
    SocketModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogggerMiddleware).forRoutes('*')
  }
}
