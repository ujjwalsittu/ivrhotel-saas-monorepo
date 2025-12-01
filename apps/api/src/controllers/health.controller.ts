import { Request, Response } from 'express';
import mongoose from 'mongoose';

/**
 * Basic health check
 */
export const healthCheck = async (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
};

/**
 * Database health check
 */
export const databaseHealth = async (req: Request, res: Response) => {
    try {
        const state = mongoose.connection.readyState;
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        if (state === 1) {
            res.json({
                status: 'ok',
                database: 'connected',
                state: states[state as keyof typeof states]
            });
        } else {
            res.status(503).json({
                status: 'error',
                database: 'not connected',
                state: states[state as keyof typeof states]
            });
        }
    } catch (error) {
        res.status(503).json({
            status: 'error',
            database: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Detailed system health
 */
export const detailedHealth = async (req: Request, res: Response) => {
    try {
        const dbState = mongoose.connection.readyState;

        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            database: {
                connected: dbState === 1,
                state: dbState
            },
            memory: {
                used: process.memoryUsage().heapUsed,
                total: process.memoryUsage().heapTotal,
                rss: process.memoryUsage().rss
            },
            cpu: process.cpuUsage()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
