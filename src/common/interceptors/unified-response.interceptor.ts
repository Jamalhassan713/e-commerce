import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map } from "rxjs";

@Injectable()
export class UnifiedResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>) {
        const response = context.switchToHttp().getResponse();
        return next.handle().pipe(
            map(data => {
                return {
                    message: "Request successful",
                    statusCode: response.statusCode,
                    data,
                };
            }),
        );
    }
}
