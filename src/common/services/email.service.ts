import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService {

    async sendEmail(
        to: string,
        subject: string,
        content: string
    ) {

        const transporter = nodemailer.createTransport({
          service: 'gmail',
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.USER_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const info = await transporter.sendMail({
            from: process.env.USER_EMAIL,
            to,
            subject,
            html: content,
        });

        return info;
    }
}