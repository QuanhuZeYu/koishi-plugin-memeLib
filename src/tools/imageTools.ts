import Data from '../Data';
import fs from 'node:fs'
import tools from './_index';
import path from 'node:path';
import logger from './logger';
import type { } from "@quanhuzeyu/koishi-plugin-canvas"
import { ComposeJoin } from '../interface/InterfaceData';
import type { Color, FitEnum } from 'sharp';
import sharp from 'sharp';

/**
 * 按顺序读取 dirPath 下的图片
 * @param dirPath 
 * @returns 图片的 Buffer 数组
 */
async function loadAllImageFPath(dirPath: string): Promise<Buffer[]> {
    // 读取目录下的所有文件
    const files = await fs.promises.readdir(dirPath);
    // 过滤并按顺序排序所有以 .png 结尾的文件
    const sortedFiles = files
        .filter(file => file.endsWith('.png'))
        .sort((a, b) => parseInt(a) - parseInt(b));

    // 按顺序读取每个文件的内容并返回 Buffer 数组
    const buffers = await Promise.all(
        sortedFiles.map(async (file) => {
            const filePath = path.join(dirPath, file);
            return fs.promises.readFile(filePath);
        })
    );

    return buffers;
}

/**
 * 
 * @param absPath 
 * @returns 
 */
async function loadImageFPath(absPath: string): Promise<Buffer> {
    try {
        const imgBuf = await fs.promises.readFile(absPath);
        return imgBuf;
    } catch (error) {
        logger.error(`读取文件时出错: ${absPath}`, error);
        throw error; // 抛出错误以便调用者处理
    }
}

/**
 * 从目录中读取所有 PNG 图片，返回 Buffer 数组
 * 返回的数组按照文件读取顺序排列
 * @param dirPath 目录路径
 * @returns Promise<Buffer[]> 图片的 Buffer 数组
 */
async function loadImagesFromDir(dirPath: string): Promise<Buffer[]> {
    try {
        // 读取目录中的所有文件名
        const files: string[] = await fs.promises.readdir(dirPath);

        // 过滤出所有 .png 文件
        const pngFiles: string[] = files.filter(file => file.toLowerCase().endsWith('.png'));

        // 读取每个 PNG 文件并转换为 Buffer
        const buffers: Buffer[] = await Promise.all(
            pngFiles.map(async (file) => {
                const filePath = path.resolve(dirPath, file);
                return await fs.promises.readFile(filePath);
            })
        );

        return buffers;
    } catch (error: any) {
        throw new Error(`Error reading images from directory: ${dirPath}, Error: ${error.message}`);
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
        await fs.promises.writeFile(fileName, imgBuf);
        // 成功保存文件后在控制台打印消息
        logger.info(`文件已成功保存为 ${fileName}`);
    } catch (error) {
        // 打印保存文件时出现的错误信息
        logger.error(`保存文件时出错: ${fileName}`, error);
        // 抛出错误以便调用者处理
        throw error;
    }
}

/**
 * 输入 图像 Buffer 输出裁切为圆形的图像 Buffer
 * @param imageBuffer 
 * @returns 
 */
async function cropToCircle(imageBuffer: Buffer): Promise<Buffer | undefined> {
    const { baseData } = Data
    const { memeGenDir, sharp, logger } = baseData
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
            `<svg><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`
        );

        // 裁剪并保存图像
        const outBuf = await image
            .resize(size, size, { fit: 'cover', position: 'center' })
            .composite([{
                input: circleShape,
                blend: 'dest-in'
            }]).png().toBuffer();
        // logger.info("圆形裁剪完成");
        return outBuf
    } catch (error) {
        logger.error("裁剪过程中发生错误:", error);
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
        buffer[0],
        buffer[1],
        buffer[2],
        buffer[3],
        buffer[4],
        buffer[5]
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

/**
 * 将两个图片长宽进行对齐
 * @param input 第一张图片的 Buffer
 * @param input1 第二张图片的 Buffer
 * @returns 返回一个 Promise，解析为包含对齐后的两张图片的 Buffer
 */
async function align2imgSize(input: Buffer, input1: Buffer): Promise<[Buffer, Buffer]> {
    const { baseData } = Data
    const { memeGenDir, sharp, logger } = baseData
    // 获取两张图片的尺寸
    const img1Metadata = await sharp(input).metadata();
    const img2Metadata = await sharp(input1).metadata();

    const width = Math.max(img1Metadata.width || 0, img2Metadata.width || 0); // 选择较大的宽度
    const height = Math.max(img1Metadata.height || 0, img2Metadata.height || 0); // 选择较大的高度

    // 调整图片尺寸
    const resizedImg1 = sharp(input).resize(width, height, { fit: 'contain' }).toBuffer();
    const resizedImg2 = sharp(input1).resize(width, height, { fit: 'contain' }).toBuffer();

    // 返回调整后的图片
    return Promise.all([resizedImg1, resizedImg2]);
}


async function align3imgSize(target: Buffer, input1: Buffer, input2: Buffer): Promise<[Buffer, Buffer]> {
    [target, input1] = await align2imgSize(target, input1);
    [target, input2] = await align2imgSize(target, input2);
    return [input1, input2]
}


async function alignAtoB(a: Buffer, b: Buffer) {
    const { baseData } = Data
    const { memeGenDir, sharp, logger } = baseData
    // 获取B的尺寸
    const bMetadata = await sharp(b).metadata();
    // B的长宽
    const bWidth = bMetadata.width || 0;
    const bHeight = bMetadata.height || 0;
    // 调整A的尺寸
    return sharp(a).resize(bWidth, bHeight, { fit: 'contain' }).toBuffer();
}

/**
 * 透视拉伸
 * @param input 待处理图像
 * @param x 角度，整数，45° = 45（可为空）
 * @param y 角度，整数，45° = 45（可为空）
 * @returns 
 */
async function perspectiveStretching(input: Buffer, canvaData: { x?: number, y?: number, rotate?: number }) {
    const { baseData, tools } = Data
    const debug = tools.debug || console.log  // 若未定义 debug，使用 console.log 作为替代
    let { x, y, rotate } = canvaData
    // 如果 x 和 y 都为 null 或 undefined，抛出错误
    if (x == null && y == null) {
        throw new Error('至少需要提供 x 或 y 的值')
    }
    // 如果 x 或 y 为空，给它们赋默认值 0
    x = x ?? 0
    y = y ?? 0
    // Debug 输出传入的角度值
    debug(`透视拉伸开始: x=${x}, y=${y}`)
    const meta = await baseData.sharp(input).metadata()
    const { width, height } = meta
    // 创建 Canvas
    const canva = await baseData.canvas.createCanvas(width, height)
    const ctx = canva.getContext('2d')
    // 加载图像
    const image = await baseData.canvas.loadImage(input)
    // 清除画布
    ctx.clearRect(0, 0, width, height)
    // 将坐标系原点设置为图像的中心
    ctx.translate(width / 2, height / 2)
    // 将角度转换为弧度，使用标准的角度转弧度公式：角度 * Math.PI / 180
    const shearY = y * Math.PI / 180  // Y 轴方向倾斜
    const shearX = x * Math.PI / 180  // X 轴方向倾斜
    // 合并 X 和 Y 轴的仿射变换
    ctx.transform(1, Math.tan(shearX), Math.tan(shearY), 1, 0, 0)
    // 绘制图像，调整位置，使得图像中心对准画布中心
    ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2)
    // Debug 输出处理完成
    debug('透视拉伸完成')
    // 输出处理后的图像为 buffer
    const buffer = await canva.toBuffer("image/png")
    const rot = await sharp(buffer).png().rotate(rotate, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer()
    return rot
}


/**
 * 数组第一个图像作为图像的原始数据，其余图像按照混合参数参与合成
 * 合成顺序：缩放，平面旋转，透视旋转，叠图选项
 * @param join 
 */
async function compose(join: ComposeJoin[]) {
    const { baseData } = Data
    const { memeGenDir, sharp, logger } = baseData
    // 按顺序将图像叠放 第一张图像大小设置为图像尺寸
    let curImg = join[0].img
    let background: Color = { r: 0, g: 0, b: 0, alpha: 0 }
    let fit: keyof FitEnum = "cover"
    // 将数组第一个元素剔除
    join.shift()
    for (const frame of join) {
        let img = frame.img
        fit = frame.frameData.resizeFit ? frame.frameData.resizeFit : fit
        background = frame.frameData.resizeBackground ? frame.frameData.resizeBackground : background
        // 缩放宽高
        if (frame.frameData.width && frame.frameData.height) {
            img = await sharp(img).resize(frame.frameData.width, frame.frameData.height, { fit: fit, background: background }).png().toBuffer()
        }
        // 旋转
        if (frame.frameData.rotate) {
            img = await sharp(img).rotate(frame.frameData.rotate, { background: background }).toBuffer()
        }
        if (frame.frameData.canvas) {
            img = await perspectiveStretching(img, frame.frameData.canvas.p_rotate)
        }
        const frameData = frame.frameData
        curImg = await sharp(curImg)
            .composite([{
                input: img,
                left: frameData.x || 0,
                top: frameData.y || 0,
                blend: frameData.blendOption || "over",
            }])
            .png().toBuffer()
    }
    return curImg
}


const imageTools = {
    cropToCircle,
    loadAllImageFPath, loadImageFPath, loadImagesFromDir, saveImageFBuffer,
    isPng, isGif, isJpg,
    align2imgSize, align3imgSize, alignAtoB,
    perspectiveStretching,
    compose
}

export default imageTools