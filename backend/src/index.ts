import { app } from './app';
import { config } from './config/index';
import { initDatabase } from './db/index';
import { seedTasks } from './db/seed';
import { logger } from './utils/logger';

async function bootstrap() {
  try {
    // 1. Initialize SQLite Database & Schema
    initDatabase();

    // 2. Automatically Seed Tasks Catalogue if empty & demo user
    await seedTasks();

    // 3. Start Express Server
    app.listen(config.port, '0.0.0.0', () => {
      logger.info(`🚀 PadosiPro Backend API server running on port ${config.port}`);
      logger.info(`🌐 Local URL: http://localhost:${config.port}`);
      logger.info(`🩺 Health check: http://localhost:${config.port}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
