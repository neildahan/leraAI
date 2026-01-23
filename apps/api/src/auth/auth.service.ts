import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { RefreshToken, RefreshTokenDocument } from './schemas/refresh-token.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenPayload, AuthTokens, JwtPayload } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthTokens> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
    const user = await this.usersService.create({
      ...registerDto,
      passwordHash: hashedPassword,
    });

    return this.generateTokens(user._id.toString(), user.email, user.role);
  }

  async login(loginDto: LoginDto): Promise<AuthTokens> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user._id.toString(), user.email, user.role);
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const storedToken = await this.refreshTokenModel.findOne({
      token: refreshToken,
      revoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Revoke the old refresh token (rotation)
    storedToken.revoked = true;
    storedToken.revokedAt = new Date();
    await storedToken.save();

    const user = await this.usersService.findById(storedToken.userId.toString());
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateTokens(user._id.toString(), user.email, user.role);
  }

  async logout(userId: string): Promise<void> {
    await this.refreshTokenModel.updateMany(
      { userId, revoked: false },
      { revoked: true, revokedAt: new Date() },
    );
  }

  async validateUser(payload: JwtPayload): Promise<TokenPayload> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = uuidv4();
    const refreshExpiry = this.configService.get<string>('JWT_REFRESH_EXPIRY', '7d');
    const expiresAt = this.calculateExpiry(refreshExpiry);

    await this.refreshTokenModel.create({
      token: refreshToken,
      userId,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getExpirySeconds(this.configService.get<string>('JWT_ACCESS_EXPIRY', '15m')),
    };
  }

  private calculateExpiry(duration: string): Date {
    const seconds = this.getExpirySeconds(duration);
    return new Date(Date.now() + seconds * 1000);
  }

  private getExpirySeconds(duration: string): number {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1), 10);

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900; // 15 minutes default
    }
  }
}
