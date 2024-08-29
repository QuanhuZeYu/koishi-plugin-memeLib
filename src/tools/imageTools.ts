import sharp from 'node_modules/sharp/lib/index';
import fs from 'node:fs/promises'
import  tools  from './index';
import path from 'node:path';

/**
 * 
 * @param absPath 
 * @returns 
 */
async function loadImageFPath(absPath: string): Promise<Buffer> {
    try {
        const imgBuf = await fs.readFile(absPath);
        return imgBuf;
    } catch (error) {
        console.error(`读取文件时出错: ${absPath}`, error);
        throw error; // 抛出错误以便调用者处理
    }
}

/**
 * 异步函数：将图像缓冲区的数据保存为指定文件名的文件
 * @param imgBuf 图像数据的缓冲区对象，通常来自图像处理或转换操作
 * @param fileName 要保存的文件名，包括路径和文件扩展名；即完整路径
 * @returns 无返回值
 * 
 * 此函数首先确保文件所在的目录存在，然后尝试将缓冲区数据写入文件
 * 如果写入操作成功，它会在控制台打印成功消息；如果失败，则会打印错误信息并抛出错误
 */
async function saveImageFBuffer(imgBuf: Buffer, fileName: string): Promise<void> {
    // 确保文件所在目录存在，如果不存在则创建
    const parentDir = path.join(fileName, '..')
    tools.dirTools.ensureDirectoryExists(parentDir)
    try {
        // 将缓冲区数据异步写入文件，减少IO阻塞风险
        await fs.writeFile(fileName, imgBuf);
        // 成功保存文件后在控制台打印消息
        console.log(`文件已成功保存为 ${fileName}`);
    } catch (error) {
        // 打印保存文件时出现的错误信息
        console.error(`保存文件时出错: ${fileName}`, error);
        // 抛出错误以便调用者处理
        throw error;
    }
}

/**
 * 输入 图像 Buffer 输出裁切为圆形的图像 Buffer
 * @param imageBuffer 
 * @returns 
 */
async function cropToCircle(imageBuffer:Buffer): Promise<Buffer|undefined>  {
    
    try {
        // 读取图像
        // const image = sharp(inputPath);
        // 使用 Sharp 处理内存中的图像
        const image = sharp(imageBuffer);
        
        // 获取图像元数据
        const metadata = await image.metadata();
        const width = metadata.width;
        const height = metadata.height;
        
        if (!width || !height) {
            throw new Error("无法获取图像尺寸");
        }
        
        // 计算圆形裁剪区域
        const size = Math.min(width, height);
        const circleShape = Buffer.from(
        `<svg><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/></svg>`
        );

        // 裁剪并保存图像
        const outBuf = await image
        .resize(size, size, { fit: 'cover', position: 'center' })
        .composite([{
            input: circleShape,
            blend: 'dest-in'
        }]).png().toBuffer();
        // console.log("圆形裁剪完成");
        return outBuf
    } catch (error) {
      console.error("裁剪过程中发生错误:", error);
    }
}

/** 判断是否是PNG */
function isPng(buffer: Buffer): boolean {
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    return buffer.length >= 8 && buffer.compare(pngSignature, 0, 8, 0, 8) === 0;
}

/** 判断是否是GIF */
function isGif(buffer: Buffer): boolean {
    const gif87aSignature = [0x47, 0x49, 0x46, 0x38, 0x37, 0x61];
    const gif89aSignature = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61];

    if (buffer.length < 6) {
        return false;
    }

    const header = [
        buffer.readUInt8(0),
        buffer.readUInt8(1),
        buffer.readUInt8(2),
        buffer.readUInt8(3),
        buffer.readUInt8(4),
        buffer.readUInt8(5)
    ];

    return (
        arraysEqual(header, gif87aSignature) ||
        arraysEqual(header, gif89aSignature)
    );
}

/** 比较两个字节数组是否相等 */
function arraysEqual(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}
/** 判断是否是JPG */
function isJpg(buffer: Buffer): boolean {
    const jpgSignature = Buffer.from([0xFF, 0xD8, 0xFF]);
    return buffer.length >= 3 && buffer.compare(jpgSignature, 0, 3, 0, 3) === 0;
}


const imageTools = {cropToCircle, loadImageFPath, saveImageFBuffer, isPng, isGif, isJpg}

export default imageTools