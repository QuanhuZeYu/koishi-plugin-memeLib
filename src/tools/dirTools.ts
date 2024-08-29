import fs from 'fs';

function ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`目录已创建: ${dirPath}`);
    } else {
        // console.log(`目录已存在: ${dirPath}`);
    }
}

const dirTools = {
    ensureDirectoryExists
}

export default dirTools;