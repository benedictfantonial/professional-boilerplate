import jwt, {
    TokenExpiredError,
    JsonWebTokenError,
    type SignOptions,
} from 'jsonwebtoken';

import bcrypt from 'bcrypt';

import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { UnauthorizedError } from '../utils/errors';
import { config } from '../config/env';
import { createLogger } from '../utils/logger';

const logger = createLogger('AuthService');
const userRepository = AppDataSource.getRepository(User);

interface RegisterInput {
    name: string;
    email: string;
    password: string;
    age?: number;
}

interface LoginInput {
    email: string;
    password: string;
}

interface TokenPayload {
    userId: number;
    email: string;
}

interface AuthResponse {
    token: string;
    user: {
        id: number;
        email: string;
        name: string;
    };
}

export class AuthService {

    /**
     * Register a new user and generate JWT token
     */
    static async register(input: RegisterInput): Promise<AuthResponse> {
        const { name, email, password, age } = input;

        const existingUser = await userRepository.findOne({
            where: { email },
            select: { id: true },
        });

        if (existingUser) {
            logger.warn('Registration attempt with existing email', { email });
            throw new UnauthorizedError('Email is already registered');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = userRepository.create({
            name,
            email,
            password: hashedPassword,
            ...(age !== undefined ? { age } : {}),
            isActive: true,
            isVerified: true,
        });

        const savedUser = await userRepository.save(newUser);

        const tokenPayload: TokenPayload = {
            userId: savedUser.id,
            email: savedUser.email,
        };

        const options: SignOptions = {
            expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'],
        };

        const token = jwt.sign(
            tokenPayload,
            config.jwt.secret,
            options
        );

        logger.info('User registered successfully', {
            userId: savedUser.id,
            email: savedUser.email,
        });

        return {
            token,
            user: {
                id: savedUser.id,
                email: savedUser.email,
                name: savedUser.name,
            },
        };
    }

    /**
     * Login user and generate JWT token
     */
    static async login(input: LoginInput): Promise<AuthResponse> {
        const { email, password } = input;

        const user = await userRepository.findOne({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                password: true,
                isActive: true,
                isVerified: true,
            },
        });

        if (!user) {
            logger.warn('Login attempt with non-existent email', { email });
            throw new UnauthorizedError('Invalid email or password');
        }

        // Check email verification
        if (!user.isVerified) {
            logger.warn('Login attempt for unverified account', { email });

            throw new UnauthorizedError(
                'Please verify your email address before logging in. Check your inbox for the verification link.'
            );
        }

        // Check account status
        if (!user.isActive) {
            logger.warn('Login attempt for inactive account', { email });
            throw new UnauthorizedError('Account is deactivated');
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            logger.warn('Login attempt with wrong password', { email });
            throw new UnauthorizedError('Invalid email or password');
        }

        // Generate JWT token
        const tokenPayload: TokenPayload = {
            userId: user.id,
            email: user.email,
        };

        const options: SignOptions = {
            expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'],
        };

        const token = jwt.sign(
            tokenPayload,
            config.jwt.secret,
            options
        );

        logger.info('User logged in successfully', {
            userId: user.id,
            email,
        });

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        };
    }

    /**
     * Verify JWT token and return decoded payload
     */
    static async verifyToken(token: string): Promise<TokenPayload> {
        try {
            const decoded = jwt.verify(
                token,
                config.jwt.secret
            ) as TokenPayload;

            return decoded;

        } catch (error: unknown) {

            if (error instanceof TokenExpiredError) {
                throw new UnauthorizedError('Token has expired');
            }

            if (error instanceof JsonWebTokenError) {
                throw new UnauthorizedError('Invalid token');
            }

            throw new UnauthorizedError('Authentication failed');
        }
    }

    /**
     * Get user from token
     */
    static async getUserFromToken(token: string): Promise<User> {
        const decoded = await this.verifyToken(token);

        const user = await userRepository.findOne({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                isActive: true,
                isVerified: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        if (!user.isActive) {
            throw new UnauthorizedError('Account is deactivated');
        }

        return user;
    }
}