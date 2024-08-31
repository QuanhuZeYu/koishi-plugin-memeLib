import fs from 'fs';
import logger from './logger';

function ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        logger.info(`目录已创建: ${dirPath}`);
    } else {
        // logger.info(`目录已存在: ${dirPath}`);
    }
}

const dirTools = {
    ensureDirectoryExists
}

export default dirTools;