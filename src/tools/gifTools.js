"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_stream_1 = require("node:stream");
/**
 * 检查并创建输出路径
 * @param dirPath 要检查或创建的目录路径
 */
function ensureDirectoryExists(dirPath) {
    if (!node_fs_1.default.existsSync(dirPath)) {
        node_fs_1.default.mkdirSync(dirPath, { recursive: true });
        console.log(`目录已创建: ${dirPath}`);
    }
    else {
        // console.log(`目录已存在: ${dirPath}`);
    }
}
async function saveGifToFile(gifBuffer, outputPath) {
    try {
        // 验证 GIF buffer
        if (!Buffer.isBuffer(gifBuffer) || gifBuffer.length === 0) {
            throw new Error('提供的 GIF buffer 无效');
        }
        // 验证输出路径
        const resolvedPath = node_path_1.default.resolve(outputPath);
        if (node_path_1.default.dirname(resolvedPath) === resolvedPath) {
            throw new Error('输出路径无效或没有目录');
        }
        // 确保目录存在
        const dir = node_path_1.default.dirname(resolvedPath);
        await node_fs_1.default.promises.mkdir(dir, { recursive: true });
        // 写入 GIF buffer 到文件
        await node_fs_1.default.promises.writeFile(resolvedPath, gifBuffer);
        console.log(`GIF 已保存到 ${resolvedPath}`);
    }
    catch (error) {
        console.error('保存 GIF 时发生错误:', error.message);
        // 重新抛出错误以便上层调用处理
        throw error;
    }
}
// 从 Buffer 提取 GIF 的所有帧
function extractGifFramesFromBuffer(gifBuffer, outputDir) {
    ensureDirectoryExists(outputDir);
    return new Promise((resolve, reject) => {
        const inputStream = new node_stream_1.PassThrough();
        inputStream.end(gifBuffer);
        (0, fluent_ffmpeg_1.default)()
            .input(inputStream)
            .inputFormat('gif')
            .output(node_path_1.default.join(outputDir, 'frame_%03d.png'))
            .outputOptions('-vf', 'fps=15') // 提取每帧
            .on('end', () => {
            console.log('帧提取完成');
            resolve();
        })
            .on('error', (err) => {
            console.error('提取帧时发生错误:', err);
            reject(err);
        })
            .run();
    });
}
const gifTools = { saveGifToFile, extractGifFramesFromBuffer };
exports.default = gifTools;
