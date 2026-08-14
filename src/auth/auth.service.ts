import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtSignOptions } from "@nestjs/jwt";
import { TokenService, TokenTypes } from "@/common";
import { BlackListTokenRepository, UserRepository, UserType } from "@/db";;
import { compareHash, encrypt, generateHash } from "@/utils";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { confirmEmailDto, forgotPasswordDto, loginDto, refreshTokenDto, registerDto, resetPasswordDto, SendOtpAgainDto } from "./auth.dto";


@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly eventEmitter: EventEmitter2,
    private readonly blackListTokenRepository: BlackListTokenRepository
  ) { }

  async register(body: registerDto) {

    const { firstName, lastName, email, password, age, gender, phoneNumber } = body;

    const isEmailExist = await this.userRepository.exists({ email });
    if (isEmailExist) throw new ConflictException('Email already exist');


    const hashedPassword = generateHash(password);
    const encryptedPhoneNumber = encrypt(phoneNumber);

    const user = await this.userRepository.createDocument({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      age,
      gender,
      phoneNumber: encryptedPhoneNumber
    });

    this.eventEmitter.emit('user.register', {
      email: user.email,
      firstName: user.firstName,
      userId: user._id
    });

    return user;
  }

  async confirmEmail(body: confirmEmailDto) {

    const { email, otp } = body;

    const user = await this.userRepository.findOneDocument(
      { email },
      '+otp'
    );

    if (!user) throw new NotFoundException('User not found');
    if (user.isVerified) throw new BadRequestException('Email already verified');
    if (!user.otp) throw new BadRequestException('OTP not found');

    if (!user.otpExpiresIn || user.otpExpiresIn < new Date()) {
      throw new UnauthorizedException('OTP expired');
    }

    const isOtpValid = compareHash(otp, user.otp);
    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.userRepository.updateDocument(
      { email },
      {
        isVerified: true,
        $unset: {
          otp: 1,
          otpExpiresIn: 1
        }
      }
    );

    return { message: 'Email verified successfully' };
  }
  async sendOtpAgain(body: SendOtpAgainDto) {
    const { email } = body;
    const user = await this.userRepository.findOneDocument({ email });
    if (!user) throw new NotFoundException('User not found');
    if (user.isVerified) throw new BadRequestException('Email already verified');

    this.eventEmitter.emit('user.register', {
      email: user.email,
      firstName: user.firstName
    });

    return { message: 'OTP sent successfully' };
  }

  async login(body: loginDto) {
    const { email, password } = body;

    const user = await this.userRepository.findOneDocument(
      { email },
      '+password'
    );

    if (!user) throw new NotFoundException('User not found');
    if (!user.password) throw new BadRequestException('Password is required')
    if (!user.isVerified) throw new BadRequestException("Please confirm your email first");
    if (user.isDeleted) throw new BadRequestException("Your account has been deleted");

    const isPasswordValid = compareHash(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    if (!user.isVerified) throw new BadRequestException("Please confirm your email first");

    const accessToken = this.tokenService.generateToken(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        type: TokenTypes.ACCESS
      },
      {
        secret: process.env.JWT_ACCESS_SECRET as string,
        expiresIn: process.env.JWT_ACCESS_EXPIRE_IN as JwtSignOptions['expiresIn'],
      });
    const refreshToken = this.tokenService.generateToken(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        type: TokenTypes.REFRESH
      },
      {
        secret: process.env.JWT_REFRESH_SECRET as string,
        expiresIn: process.env.JWT_REFRESH_EXPIRE_IN as JwtSignOptions['expiresIn']

      });

    return { message: 'Login successful', accessToken, refreshToken };
  }
  async refreshToken(body: refreshTokenDto) {

    const { refreshToken } = body;

    if (!refreshToken) throw new BadRequestException('Refresh token is required');

    const isBlackListed = await this.blackListTokenRepository.exists({ token: refreshToken });

    if (isBlackListed) throw new UnauthorizedException('Invalid refresh token');

    let decoded: any;

    try {
      decoded = this.tokenService.verifyToken(
        refreshToken,
        {
          secret: process.env.JWT_REFRESH_SECRET as string
        }
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (decoded.type !== TokenTypes.REFRESH) {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.userRepository.findById(decoded.id);

    if (!user) throw new NotFoundException('User not found');

    if (user.isDeleted) throw new BadRequestException('Your account is deactivated');
    if (!user.isVerified) throw new UnauthorizedException('Please verify your account first');

    await this.blackListTokenRepository.createDocument({
      token: refreshToken,
      tokenType: TokenTypes.REFRESH,
      expiresAt: new Date(decoded.exp * 1000)
    });

    const newAccessToken = this.tokenService.generateToken(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        type: TokenTypes.ACCESS
      },
      {
        secret: process.env.JWT_ACCESS_SECRET as string,
        expiresIn: process.env.JWT_ACCESS_EXPIRE_IN as JwtSignOptions['expiresIn']
      }
    );

    const newRefreshToken = this.tokenService.generateToken(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        type: TokenTypes.REFRESH
      },
      {
        secret: process.env.JWT_REFRESH_SECRET as string,
        expiresIn: process.env.JWT_REFRESH_EXPIRE_IN as JwtSignOptions['expiresIn']
      }
    );

    return {
      message: 'Token refreshed successfully',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  async logOut(request: any) {
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) throw new BadRequestException('Token not found');
    const exists = await this.blackListTokenRepository.exists({ token });

    if (exists) return { message: 'Already logged out' };
    const decoded = request.loggedInUser.verifiedData;

    await this.blackListTokenRepository.createDocument({
      token,
      tokenType: TokenTypes.ACCESS,
      expiresAt: new Date(decoded.exp * 1000)
    });
    return { message: 'Logged out successfully' }
  }
  async forgotPassword(body: forgotPasswordDto) {

    const { email } = body;

    const user = await this.userRepository.findOneDocument({ email });
    if (!user) throw new NotFoundException('User not found');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = generateHash(otp);

    await this.userRepository.updateDocument(
      { email },
      {
        otp: hashedOtp,
        otpExpiresIn: new Date(Date.now() + 5 * 60 * 1000)
      }
    );

    this.eventEmitter.emit('user.forgot-password', {
      email,
      otp
    });

    return { message: 'OTP sent to email' };
  }

  async resetPassword(body: resetPasswordDto) {

    const { email, otp, newPassword } = body;

    const user = await this.userRepository.findOneDocument({ email }, '+otp +otpExpiresIn');
    if (!user) throw new NotFoundException('User not found');

    if (!user.otp) throw new BadRequestException('OTP not found');

    if (!user.otpExpiresIn || user.otpExpiresIn < new Date())
      throw new UnauthorizedException('OTP expired');

    const isOtpValid = compareHash(otp, user.otp);
    if (!isOtpValid) throw new UnauthorizedException('Invalid OTP');

    const hashedPassword = generateHash(newPassword);

    await this.userRepository.updateDocument(
      { email },
      {
        password: hashedPassword,
        $unset: {
          otp: 1,
          otpExpiresIn: 1
        }
      } as any
    );

    return { message: 'Password reset successfully' };
  }
}