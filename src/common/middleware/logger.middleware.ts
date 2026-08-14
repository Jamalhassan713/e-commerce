import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";


@Injectable()
export class LogggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {

        const { url, method } = req
        const startTime = Date.now()

        res.on('finish', () => {
            const endTime = Date.now()
            const responseTime = endTime - startTime
            console.log(`${method} ${url} ${responseTime}`);
        })

        next()
    }
}