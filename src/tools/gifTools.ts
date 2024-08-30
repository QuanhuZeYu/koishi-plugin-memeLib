import Ffmpeg from 'fluent-ffmpeg';
import fs from 'node:fs'
import path from "node:path";
import * as _canvaGif from "@canvacord/gif";
import { PassThrough, Readable } from 'node:stream';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { writeFile } from 'fs/promises';
import  tools  from './index';
// import gifFrames from 'gif-frames';

export interface FrameData {
    x: number
    y: number
    width: number
    height: number
}


/**
 * 检查并创建输出路径
 * @param dirPath 要检查或创建的目录路径
 */
async function saveGifToFile(gifBuffer: Buffer, outputPath: string): Promise<void> {
    try {
        // 验证 GIF buffer
        if (!Buffer.isBuffer(gifBuffer) || gifBuffer.length === 0) {
            throw new Error('提供的 GIF buffer 无效');
        }

        // 验证输出路径
        const resolvedPath = path.resolve(outputPath);
        if (path.dirname(resolvedPath) === resolvedPath) {
            throw new Error('输出路径无效或没有目录');
        }

        // 确保目录存在
        const dir = path.dirname(resolvedPath);
        await fs.promises.mkdir(dir, { recursive: true });

        // 写入 GIF buffer 到文件
        await fs.promises.writeFile(resolvedPath, gifBuffer);
        // console.log(`GIF 已保存到 ${resolvedPath}`);
    } catch (error: any) {
        console.error('保存 GIF 时发生错误:', error.message);
        // 重新抛出错误以便上层调用处理
        throw error;
    }
}

function extractGifFramesFromBuffer(
    gifBuffer: Buffer, 
    outputDir?: string, 
    fps?: number
): Promise<void | Buffer[]> {
    if (!gifBuffer) {
        throw new Error('无效的 GIF 缓冲区');
    }

    if (outputDir) {
        tools.dirTools.ensureDirectoryExists(outputDir);

        return new Promise<void>((resolve, reject) => {
            const inputStream = new PassThrough();
            inputStream.end(gifBuffer);

            const ffmpegCommand = Ffmpeg()
                .input(inputStream)
                .inputFormat('gif')
                .output(path.join(outputDir, 'frame_%03d.png'))
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
    } else {
        return new Promise<Buffer[]>((resolve, reject) => {
            const inputStream = new PassThrough();
            inputStream.end(gifBuffer);

            const frameBuffers: Buffer[] = [];
            const outputStream = new PassThrough();

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

            const ffmpegCommand = Ffmpeg()
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


async function extraGIF(gifBuffer: Buffer) {
    // 将 ReadableStream 转换为 Buffer 的辅助函数
    const streamToBuffer = _canvaGif.streamToBuffer
    const Decoder = _canvaGif.Decoder
    const decoder = new Decoder(gifBuffer);
    const rawFrames = decoder.decode();
    // 读取每一帧
    const frames = decoder.toPNG(rawFrames)
    const promiseBufs:Promise<Buffer>[] = []
    frames.forEach((frame,i)=>{
        const buf = streamToBuffer(frame)
        promiseBufs.push(buf)
    })
    return Promise.all(promiseBufs)
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
  


function bufferToStream(buffer: Buffer) {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null); // 结束流
    return stream;
}


/** 将 Buffer 转换为临时文件 */
async function bufferToTempFile(buffer: Buffer): Promise<string> {
    const tempFilePath = path.join(tmpdir(), `${randomUUID()}.gif`);
    await writeFile(tempFilePath, buffer);
    return tempFilePath;
  }


const gifTools = { 
    saveGifToFile,extractGifFramesFromBuffer,extraGIF
}

export default gifTools