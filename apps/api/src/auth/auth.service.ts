import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

interface TokenPayload {
    sub: string;
    email: string;
    organizationId: string;
    role: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async signup(signupDto: SignupDto) {
        const { email, password, name, organizationName } = signupDto;

        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create organization and user in a transaction
        const result = await this.prisma.$transaction(async (tx) => {
            // Create organization
            const organization = await tx.organization.create({
                data: {
                    name: organizationName || `${email}'s Workspace`,
                    slug: this.generateSlug(organizationName || email),
                },
            });

            // Create user
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: name || null,
                    organizationId: organization.id,
                    role: 'owner', // First user is owner
                },
            });

            return { user, organization };
        });

        // Generate tokens
        const tokens = await this.generateTokens(result.user);

        // Return user info without password
        return {
            user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                role: result.user.role,
                organizationId: result.user.organizationId,
            },
            ...tokens,
        };
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // Find user
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account is deactivated');
        }

        // Check if user has a password (if not, they are an OAuth user)
        if (!user.password) {
            throw new UnauthorizedException('Please log in with Google or GitHub');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Update last login
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // Generate tokens
        const tokens = await this.generateTokens(user);

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                organizationId: user.organizationId,
            },
            ...tokens,
        };
    }

    async validateOAuthLogin(profile: {
        email: string;
        name: string;
        provider: string;
        providerId: string;
        avatarUrl?: string;
    }) {
        const { email, name, provider, providerId, avatarUrl } = profile;

        // Check if user exists
        let user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (user) {
            // Update user with OAuth info if missing or just to sync
            if (!user.provider || user.provider === 'email') {
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: { provider, providerId, avatarUrl: user.avatarUrl || avatarUrl },
                });
            }
        } else {
            // Create new user (and organization)
            const result = await this.prisma.$transaction(async (tx) => {
                const organization = await tx.organization.create({
                    data: {
                        name: `${name || email}'s Workspace`,
                        slug: this.generateSlug(name || email),
                    },
                });

                const newUser = await tx.user.create({
                    data: {
                        email,
                        name,
                        provider,
                        providerId,
                        avatarUrl,
                        organizationId: organization.id,
                        role: 'owner',
                    },
                });

                return newUser;
            });
            user = result;
        }

        // Generate tokens
        const tokens = await this.generateTokens(user);

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                organizationId: user.organizationId,
            },
            ...tokens,
        };
    }

    async refreshTokens(refreshToken: string): Promise<AuthTokens> {
        // Find the refresh token
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if (!storedToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (storedToken.expiresAt < new Date()) {
            // Delete expired token
            await this.prisma.refreshToken.delete({
                where: { id: storedToken.id },
            });
            throw new UnauthorizedException('Refresh token expired');
        }

        if (!storedToken.user.isActive) {
            throw new UnauthorizedException('Account is deactivated');
        }

        // Delete old refresh token (rotation)
        await this.prisma.refreshToken.delete({
            where: { id: storedToken.id },
        });

        // Generate new tokens
        return this.generateTokens(storedToken.user);
    }

    async logout(refreshToken: string): Promise<void> {
        await this.prisma.refreshToken.deleteMany({
            where: { token: refreshToken },
        });
    }

    async logoutAll(userId: string): Promise<void> {
        await this.prisma.refreshToken.deleteMany({
            where: { userId },
        });
    }

    private async generateTokens(user: {
        id: string;
        email: string;
        organizationId: string;
        role: string;
    }): Promise<AuthTokens> {
        const payload: TokenPayload = {
            sub: user.id,
            email: user.email,
            organizationId: user.organizationId,
            role: user.role,
        };

        // Generate access token (15 minutes)
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '15m',
        });

        // Generate refresh token (7 days)
        const refreshToken = uuidv4();
        const refreshTokenExpiry = new Date();
        refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

        // Store refresh token in database
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: refreshTokenExpiry,
            },
        });

        return { accessToken, refreshToken };
    }

    private generateSlug(input: string): string {
        const baseSlug = input
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Add random suffix to ensure uniqueness
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        return `${baseSlug}-${randomSuffix}`;
    }
}
