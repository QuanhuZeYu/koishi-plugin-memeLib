"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
const promises_1 = __importDefault(require("node:fs/promises"));
/**
 *
 * @param absPath
 * @returns
 */
async function loadImageFPath(absPath) {
    try {
        const imgBuf = await promises_1.default.readFile(absPath);
        return imgBuf;
    }
    catch (error) {
        console.error(`读取文件时出错: ${absPath}`, error);
        throw error; // 抛出错误以便调用者处理
    }
}
async function saveImageFBuffer(imgBuf, fileName) {
    try {
        await promises_1.default.writeFile(fileName, imgBuf);
        console.log(`文件已成功保存为 ${fileName}`);
    }
    catch (error) {
        console.error(`保存文件时出错: ${fileName}`, error);
        throw error; // 抛出错误以便调用者处理
    }
}
/**
 * 输入 图像 Buffer 输出裁切为圆形的图像 Buffer
 * @param imageBuffer
 * @returns
 */
async function cropToCircle(imageBuffer) {
    try {
        // 读取图像
        // const image = sharp(inputPath);
        // 使用 Sharp 处理内存中的图像
        const image = (0, sharp_1.default)(imageBuffer);
        // 获取图像元数据
        const metadata = await image.metadata();
        const width = metadata.width;
        const height = metadata.height;
        if (!width || !height) {
            throw new Error("无法获取图像尺寸");
        }
        // 计算圆形裁剪区域
        const size = Math.min(width, height);
        const circleShape = Buffer.from(`<svg><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`);
        // 裁剪并保存图像
        const outBuf = await image
            .resize(size, size, { fit: 'cover', position: 'center' })
            .composite([{
                input: circleShape,
                blend: 'dest-in'
            }]).png().toBuffer();
        // console.log("圆形裁剪完成");
        return outBuf;
    }
    catch (error) {
        console.error("裁剪过程中发生错误:", error);
    }
}
/** 判断是否是png */
function isPng(buffer) {
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    return buffer.slice(0, 8).equals(pngSignature);
}
/** 判断是否是gif */
function isGif(buffer) {
    const gif87aSignature = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]);
    const gif89aSignature = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
    const header = buffer.slice(0, 6);
    return header.equals(gif87aSignature) || header.equals(gif89aSignature);
}
/** 判断是否是jpg */
function isJpg(buffer) {
    const jpgSignature = Buffer.from([0xFF, 0xD8, 0xFF]);
    return buffer.slice(0, 3).equals(jpgSignature);
}
const imageTools = { cropToCircle, loadImageFPath, saveImageFBuffer, isPng, isGif, isJpg };
exports.default = imageTools;
