"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveGifToFile = saveGifToFile;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function saveGifToFile(gifBuffer, outputPath) {
    try {
        // 验证 GIF buffer
        if (!Buffer.isBuffer(gifBuffer) || gifBuffer.length === 0) {
            throw new Error('提供的 GIF buffer 无效');
        }
        // 验证输出路径
        const resolvedPath = path_1.default.resolve(outputPath);
        if (path_1.default.dirname(resolvedPath) === resolvedPath) {
            throw new Error('输出路径无效或没有目录');
        }
        // 确保目录存在
        const dir = path_1.default.dirname(resolvedPath);
        await fs_1.default.promises.mkdir(dir, { recursive: true });
        // 写入 GIF buffer 到文件
        await fs_1.default.promises.writeFile(resolvedPath, gifBuffer);
        console.log(`GIF 已保存到 ${resolvedPath}`);
    }
    catch (error) {
        console.error('保存 GIF 时发生错误:', error.message);
        // 重新抛出错误以便上层调用处理
        throw error;
    }
}
