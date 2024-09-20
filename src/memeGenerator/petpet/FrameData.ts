import path from "node:path";
import fs from 'fs/promises'; // 使用 Promises API 以便使用 async/await
import Data from "../../Data";

import { ComposeJoin, FrameData } from "../../interface/InterfaceData";
import tools from "../../tools/_index";
import { createFrameOption } from "../../interface/InterfaceData";

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
    const { baseData } = Data
    const { memeGenDir, sharp, logger } = baseData
    const dir = path.resolve(Data.baseData.memeGenDir, 'petpet', 'images')
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

/**
 * 异步函数：生成动图GIF
 * @param inputImg 图像缓冲区，单张图片或者是GIF
 * @returns 返回一个Promise，解析为包含GIF图像的缓冲区，如果发生错误则可能返回void
 * 
 * 此函数负责生成一个动图GIF它首先加载手部图像，然后为每一帧创建相应的缓冲区图像，
 * 最后将所有帧合并生成GIF图像如果在生成过程中发生错误，会抛出异常并打印错误信息
 */
const craftPetpetGif = timeIt(
    async function genPetpetGif(inputImg: Buffer): Promise<Buffer | void> {
        const isGif = await tools.imageTools.isGif(inputImg)
        if (!isGif) {
            return await processStaticImage(inputImg)
        } else if (isGif) {
            return await processGifImage(inputImg)
        }
    })

// 处理静态图像
const processStaticImage = timeIt(async function processStaticImage(inputImg: Buffer): Promise<Buffer> {
    const result: Buffer[] = []  // 结果缓冲区
    // 读取手部图
    const hands = await loadHandImages()
    for (let i = 0; i < hands.length; i++) {
        const src = hands[i]
        const frame = frames[i]
        const join: ComposeJoin[] = [
            { img: src, frameData: {} },
            { img: inputImg, frameData: { ...frame, blendOption: "dest-over" } }
        ]
        const result_ = await tools.imageTools.compose(join)
        result.push(result_)
    }
    const gif = await tools.gifTools.pngsToGifBuffer_ffmpeg(result)
    return gif
})

// 处理 GIF 图像
const processGifImage = timeIt(async function processGifImage(inputImg: Buffer): Promise<Buffer> {
    const result: Buffer[] = []
    const hands = await loadHandImages()
    const [hands1, input2] = await tools.gifTools.align2Gif(hands, inputImg)
    for (let i = 0; i < hands1.length; i++) {
        const src = hands1[i]
        const index = i % frames.length
        const frame = frames[index]
        const join: ComposeJoin[] = [
            { img: src, frameData: {} },
            { img: input2[i], frameData: { ...frame, blendOption: "dest-over" } }
        ]
        const result_ = await tools.imageTools.compose(join)
        result.push(result_)
    }
    const gif = await tools.gifTools.pngsToGifBuffer_ffmpeg(result)
    return gif
})

export default craftPetpetGif