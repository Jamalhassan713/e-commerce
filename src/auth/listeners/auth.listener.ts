import { EmailService } from "@/common";
import { UserRepository } from "@/db/repository/user.repository";
import { generateHash } from "@/utils";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

interface IUserRegisterEvent {
    email: string;
    firstName: string;
}

@Injectable()
export class AuthListener {

    constructor(
        private readonly userRepository: UserRepository,
        private readonly emailService: EmailService
    ) { }

    @OnEvent('user.register')
    async handleSendEmail(payload: IUserRegisterEvent) {

        const { email, firstName } = payload;

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        const hashedOtp = generateHash(otp);

        await this.userRepository.updateDocument(
            { email },
            {
                otp: hashedOtp,
                otpExpiresIn: new Date(
                    Date.now() + 5 * 60 * 1000
                )
            }
        );

        await this.emailService.sendEmail(
            email,
            "Confirm Your Email",
            `
              <h1>Hello ${firstName}</h1>

              <p>Your OTP is:</p>

              <h2>${otp}</h2>

              <p>This OTP will expire in 5 minutes.</p>
            `
        );
    }
    @OnEvent('user.forgot-password')
    async handleForgotPassword(payload: any) {

        const { email, otp } = payload;

        await this.emailService.sendEmail(
            email,
            'Reset Password OTP',
            `<h2>Your OTP is: ${otp}</h2>`
        );
    }
}