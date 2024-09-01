import path from "node:path";
import fs from 'fs/promises'; // 使用 Promises API 以便使用 async/await
import sharp from "sharp";
import Ffmpeg from "fluent-ffmpeg";
import { Readable } from "stream";
import * as _canvagif from '@canvacord/gif'
import GIFEncoder from "gifencoder";

import { FrameData } from "../../interface/FrameData";
import  tools  from "../../tools/_index";
import { Stream } from "node:stream";
import { createWriteStream } from "node:fs";
import { buffer } from "node:stream/consumers";

const logger = tools.logger

const petFps = 15;
const frameTime = 15 / 1000;
const frameCounts = 5;
const gifData = {
    gifWidth: 112,
    gifHeigh: 112
}

const timeIt = tools.decorator.timeer

export const BASE_DATA = { petFps, frameTime, frameCounts, gifData };
// 手部合成的帧数据
export const frames: FrameData[] = [
    { x: 14, y: 20, width: 98, height: 98 },
    { x: 12, y: 33, width: 101, height: 85 },
    { x: 8, y: 40, width: 110, height: 76 },
    { x: 10, y: 33, width: 102, height: 84 },
    { x: 12, y: 20, width: 98, height: 98 }
];

export interface createFrameOption {
    blend:
        | "clear"
        | "source"
        | "over"
        | "in"
        | "out"
        | "atop"
        | "dest"
        | "dest-over"
        | "dest-in"
        | "dest-out"
        | "dest-atop"
        | "xor"
        | "add"
        | "saturate"
        | "multiply"
        | "screen"
        | "overlay"
        | "darken"
        | "lighten"
        | "color-dodge"
        | "colour-dodge"
        | "color-burn"
        | "colour-burn"
        | "hard-light"
        | "soft-light"
        | "difference"
        | "exclusion";
}
/**
 * 合成图片的异步函数
 * 将输入图片（inputImg）缩放并合成到背景图片（handImg）上
 * 
 * @param input - 原始输入图片数据
 * @param hand - 背景图片数据
 * @param frameData - 包含缩放和合成参数的对象
 * @returns 合成后的图片数据（Buffer）
 */
export const createFrame = timeIt(
    async function createFrame(
    input: Buffer,
    hand: Buffer,
    frameData: FrameData,
    option: createFrameOption = {
        blend: 'dest-over',
    }
) {
    // 输入验证
    if (!Buffer.isBuffer(input) || !Buffer.isBuffer(hand)) {
        throw new Error('输入的图像数据必须是 Buffer 类型');
    }

    if (
        typeof frameData.width !== 'number' ||
        typeof frameData.height !== 'number' ||
        typeof frameData.x !== 'number' ||
        typeof frameData.y !== 'number'
    ) {
        throw new Error('FrameData 参数无效，必须包含数字类型的 width、height、x 和 y 属性');
    }

    try {
        // 确保输入图片透明背景
        const resizedInputImg = await sharp(input)
            .resize(frameData.width, frameData.height) // 确保背景透明
            .png().toBuffer();

        // 合成图像
        return sharp(hand)
            .composite([
                {
                    input: resizedInputImg,
                    left: frameData.x,
                    top: frameData.y,
                    blend: option.blend,
                },
            ])
            .png().toBuffer();
    } catch (err) {
        // 错误处理
        logger.error('创建帧时发生错误:', err);
        throw err;
    }
}, false)


/**
 * 异步加载手部图像数组
 * 
 * 此函数接收一个FrameData数组作为参数，但实际不使用这些数据来生成手部图像而是通过索引
 * 它的目标是读取磁盘上的图像文件，并以Buffer数组的形式返回，以便进一步处理或显示
 * 使用sharp库来进行图像处理，因为它提供了高效的图像操作接口
 * 
 * @param frames FrameData数组，用于确定需要加载的图像数量和顺序
 * @returns 返回一个Promise，解析为包含所有手部图像的Buffer数组
 * @throws 如果任何图像文件无法读取，将抛出错误
 */
export const loadHandImages = timeIt(async function loadHandImages(): Promise<Buffer[]> {
    const dir = path.resolve(__dirname,'images')
    // 读取指定目录中的所有文件名
    const files = await fs.readdir(dir);
    try {
        // 过滤出 PNG 图像文件
        const imageFiles = files.filter(file => file.toLowerCase().endsWith('.png'));
        // 使用 Promise.all 并行加载所有图像
        const imagePromises = imageFiles.map(async (file) => {
            const filePath = path.join(dir, file);
            try {
                // 使用 sharp 读取图像文件，并确保有透明度通道
                return await sharp(filePath)
                    .ensureAlpha()  // 确保图像有透明度通道
                    .toBuffer();
            } catch (err) {
                logger.error(`读取图像 ${file} 时发生错误: ${err}`);
                throw err; // 捕获错误后抛出，保证调用者能处理
            }
        });

        // 等待所有图像加载完成
        return await Promise.all(imagePromises);
    } catch (err) {
        logger.error(`读取目录 ${dir} 时发生错误: ${err}`);
        throw err;
    }
})

const craftPng2Gif = timeIt(async function generateGif(
    frameBuffers: Buffer[], 
    fps?: number
): Promise<Buffer> {
    const gifBuf = tools.gifTools.pngsToGifBuffer_ffmpeg(frameBuffers)
    return gifBuf
});

/**
 * 异步函数：生成动图GIF
 * @param inputImg 图像缓冲区，单张图片或者是GIF
 * @returns 返回一个Promise，解析为包含GIF图像的缓冲区，如果发生错误则可能返回void
 * 
 * 此函数负责生成一个动图GIF它首先加载手部图像，然后为每一帧创建相应的缓冲区图像，
 * 最后将所有帧合并生成GIF图像如果在生成过程中发生错误，会抛出异常并打印错误信息
 */
const craftPetpetGif =  timeIt(
    async function genPetpetGif(inputImg: Buffer, isGif: boolean = false): Promise<Buffer | void> {
    if (!isGif) {
        // 处理静态图像
        const frameBuffers = await processStaticImage(inputImg);
        return frameBuffers ? craftPng2Gif(frameBuffers) : undefined;
    } else {
        // 处理 GIF 图像
        const frameBuffers = await processGifImage(inputImg);
        return frameBuffers ? craftPng2Gif(frameBuffers) : undefined;
    }
})

// 处理静态图像
async function processStaticImage(inputImg: Buffer): Promise<Buffer[] | undefined> {
    // 读取手部图
    const hands = await loadHandImages()

    // 1.合成图像
    const frameBuffers = await Promise.all(
        frames.map((frameData, index) => createFrame(inputImg, hands[index], frameData))
    );
    if (frameBuffers.every(buffer => buffer instanceof Buffer)) {
        return frameBuffers;
    } else {
        logger.error(`生成 GIF 时发生错误: 解析帧数据时发生错误`);
    }
}

// 处理 GIF 图像
const processGifImage = timeIt(async function processGifImage(inputImg: Buffer): Promise<Buffer[] | undefined> {
    // 生成新的帧数据
    const generateNewFrames = timeIt(function generateNewFrames(targetCount: number, handImgs: number): FrameData[] {
        const forTime = targetCount / handImgs;
        const newFrames: FrameData[] = [];

        for (let i = 0; i < forTime; i++) {
            newFrames.push(...frames);
        }
        return newFrames;
    })
    const _frameData = frames
    const _handCount = BASE_DATA.frameCounts
    const hands = await loadHandImages()
    const [_hands,_inputs,_rt] = await tools.gifTools.align2Gif(hands,inputImg)
    const _frameBuffers = await Promise.all(
        _hands.map(async(hand,index)=>{
            const handIndex = index % _handCount
            return createFrame(_inputs[index],hand,_frameData[handIndex],undefined)
        })
    )
    return _frameBuffers
})

export default craftPetpetGif



// 工具函数区
function gcd(a: number, b: number): number {
    // 使用欧几里得算法计算最大公约数
    return b === 0 ? a : gcd(b, a % b);
}

function formatDuration(timeMark: number, nowTime: number): string {
    // 计算时间差（毫秒）
    const diffMs = Math.abs(timeMark - nowTime);

    // 转换为秒
    const seconds = Math.floor(diffMs / 1000) % 60;
    // 转换为分钟
    const minutes = Math.floor(diffMs / (1000 * 60)) % 60;
    // 转换为小时
    const hours = Math.floor(diffMs / (1000 * 60 * 60)) % 24;

    // 格式化输出
    return `${String(hours).padStart(2, '0')}时${String(minutes).padStart(2, '0')}分${String(seconds).padStart(2, '0')}秒`;
}