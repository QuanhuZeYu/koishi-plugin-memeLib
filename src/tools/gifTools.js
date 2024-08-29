"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_stream_1 = require("node:stream");
const os_1 = require("os");
const crypto_1 = require("crypto");
const promises_1 = require("fs/promises");
const _1 = __importDefault(require("."));
/**
 * 检查并创建输出路径
 * @param dirPath 要检查或创建的目录路径
 */
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
        // console.log(`GIF 已保存到 ${resolvedPath}`);
    }
    catch (error) {
        console.error('保存 GIF 时发生错误:', error.message);
        // 重新抛出错误以便上层调用处理
        throw error;
    }
}
function extractGifFramesFromBuffer(gifBuffer, outputDir, fps) {
    if (!gifBuffer) {
        throw new Error('无效的 GIF 缓冲区');
    }
    if (outputDir) {
        _1.default.dirTools.ensureDirectoryExists(outputDir);
        return new Promise((resolve, reject) => {
            const inputStream = new node_stream_1.PassThrough();
            inputStream.end(gifBuffer);
            const ffmpegCommand = (0, fluent_ffmpeg_1.default)()
                .input(inputStream)
                .inputFormat('gif')
                .output(node_path_1.default.join(outputDir, 'frame_%03d.png'))
                .on('end', () => {
                // console.log('帧提取完成');
                resolve();
            })
                .on('error', (err) => {
                console.error('提取帧时发生错误[1]:', err);
                reject(err);
            });
            if (fps) {
                ffmpegCommand.outputOptions('-vf', `fps=${fps}`);
            }
            ffmpegCommand.run();
        });
    }
    else {
        return new Promise((resolve, reject) => {
            const inputStream = new node_stream_1.PassThrough();
            inputStream.end(gifBuffer);
            const frameBuffers = [];
            const outputStream = new node_stream_1.PassThrough();
            outputStream.on('data', (chunk) => {
                frameBuffers.push(Buffer.from(chunk));
            });
            outputStream.on('end', () => {
                // console.log('所有帧提取完成');
                resolve(frameBuffers);
            });
            outputStream.on('error', (err) => {
                console.error('提取帧时发生错误[2]:', err);
                reject(err);
            });
            const ffmpegCommand = (0, fluent_ffmpeg_1.default)()
                .input(inputStream)
                .inputFormat('gif')
                .output(outputStream)
                .outputFormat('image2pipe')
                .outputOptions('-vcodec', 'png')
                .on('end', () => {
                // console.log('处理完成');
            })
                .on('error', (err) => {
                console.error('提取帧时发生错误[3]:', err);
                reject(err);
            });
            if (fps) {
                ffmpegCommand.outputOptions('-vf', `fps=${fps}`);
            }
            ffmpegCommand.run();
        });
    }
}
/** 计算 GIF 的总帧数 通过临时文件*/
// async function getGifFrameCount(gifBuffer: Buffer): Promise<number> {
//     const tempFilePath = await bufferToTempFile(gifBuffer);
//     return new Promise((resolve, reject) => {
//       Ffmpeg.ffprobe(tempFilePath, (err, metadata) => {
//         if (err) {
//           reject(err);
//           return;
//         }
//         // 删除临时文件
//         unlink(tempFilePath).catch(console.error);
//         // 遍历每个视频流的元数据来计算帧数
//         let frameCount = 0;
//         if (metadata && metadata.streams) {
//           metadata.streams.forEach((stream) => {
//             if (stream.codec_type === 'video' && stream.nb_frames) {
//               frameCount += parseInt(stream.nb_frames, 10);
//             }
//           });
//         }
//         resolve(frameCount);
//       });
//     });
// }
/** 计算 GIF 的总帧数 直接读取Buffer*/
// async function getGifFrameCount(gifBuffer: Buffer): Promise<number> {
//     try {
//       const frames = await gifFrames({ url: gifBuffer, frames: 'all', outputType: 'canvas' });
//       return frames.length;
//     } catch (error) {
//       console.error('Error calculating frame count:', error);
//       throw error;
//     }
// }
function bufferToStream(buffer) {
    const stream = new node_stream_1.Readable();
    stream.push(buffer);
    stream.push(null); // 结束流
    return stream;
}
/** 将 Buffer 转换为临时文件 */
async function bufferToTempFile(buffer) {
    const tempFilePath = node_path_1.default.join((0, os_1.tmpdir)(), `${(0, crypto_1.randomUUID)()}.gif`);
    await (0, promises_1.writeFile)(tempFilePath, buffer);
    return tempFilePath;
}
const gifTools = {
    saveGifToFile, extractGifFramesFromBuffer
};
exports.default = gifTools;
