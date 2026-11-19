import fs from 'fs';
import path from 'path';
import winston from 'winston';
import { config } from '../config/env';

const logDir = path.resolve(process.cwd(), 'logs');
fs.mkdirSync(logDir, { recursive: true });

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
    winston.format.json()
);

const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
    winston.format.printf(({ timestamp, level, message, metadata }) => {
        const metaObj =
            metadata && typeof metadata === 'object'
                ? (metadata as Record<string, unknown>)
                : {};
        const meta = Object.keys(metaObj).length ? ` ${JSON.stringify(metaObj)}` : '';
        return `${String(timestamp)} [${level}]: ${String(message)}${meta}`;
    }),
    winston.format.colorize({ all: true })
);

export const logger = winston.createLogger({
    level: config.isProd ? 'info' : 'debug',
    format: logFormat,
    defaultMeta: { service: 'api' },
    transports: [
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5 * 1024 * 1024, // 5 MB
            maxFiles: 5,
        }),
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5 * 1024 * 1024, // 5 MB
            maxFiles: 5,
        }),
    ],
    exitOnError: false,
});

if (config.isDev) {
    logger.add(
        new winston.transports.Console({
            format: consoleFormat,
        })
    );
}

export const createLogger = (context: string) => {
    return logger.child({ context });
};