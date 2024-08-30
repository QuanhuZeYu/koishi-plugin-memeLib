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
    console.log(`共提取${frames.length}帧`)
    return Promise.all(promiseBufs)
}


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
    saveGifToFile,extraGIF
}

export default gifTools