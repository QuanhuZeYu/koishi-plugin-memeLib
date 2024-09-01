import path from "path"
import { ComposeJoin, FrameData } from "../../interface/FrameData"
import fs from 'fs/promises'
import timeIt from "src/tools/decorator/timmer"
import tools from "src/tools/_index"

const logger = tools.logger

const userLocs: FrameData[] = [
    { x: 108, y: 15, width: 120, height: 120 },
    { x: 107, y: 14, width: 120, height: 120 },
    { x: 104, y: 16, width: 120, height: 120 },
    { x: 102, y: 14, width: 120, height: 120 },
    { x: 104, y: 15, width: 120, height: 120 },
    { x: 108, y: 15, width: 120, height: 120 },
    { x: 108, y: 15, width: 120, height: 120 },
    { x: 103, y: 16, width: 120, height: 120 },
    { x: 102, y: 15, width: 120, height: 120 },
    { x: 104, y: 14, width: 120, height: 120 },
];

const selfLocs: FrameData[] = [
    { x: 78, y: 120, rotate: -48, width: 120, height: 120 },
    { x: 115, y: 130, rotate: -18, width: 120, height: 120 },
    { x: 0, y: 0, rotate: 0, width: 120, height: 120 },
    { x: 110, y: 100, rotate: 38, width: 120, height: 120 },
    { x: 80, y: 100, rotate: 31, width: 120, height: 120 },
    { x: 75, y: 115, rotate: -43, width: 120, height: 120 },
    { x: 105, y: 127, rotate: -22, width: 120, height: 120 },
    { x: 0, y: 0, rotate: 0, width: 120, height: 120 },
    { x: 110, y: 98, rotate: 34, width: 120, height: 120 },
    { x: 80, y: 105, rotate: 35, width: 120, height: 120 },
];

export const hugFrameData = {
    user:userLocs,
    self:selfLocs
}


const craftHug =timeIt(async function craftHug(input:Buffer,input2:Buffer) {
    const isGif = tools.imageTools.isGif
    // 2.判断是否有GIF
    const _b = isGif(input) || isGif(input2)
    if (!_b) {
        // 3.1纯静态图流程
        const result_ = await processStatic(input,input2)
        return result_
    } else {
        // 3.2含有GIF的处理流程
    }
})

/**
 * 传进来的两个参数必须是单张图像的Buffer
 * */
async function processStatic(input1: Buffer, input2: Buffer) {
    const compose = tools.gifTools.compose;
    const pngs2gif = tools.gifTools.pngsToGifBuffer_ffmpeg;
    let result: Buffer[] = [];

    // 1.加载底图
    const srcs = await loadImg();

    srcs.map(async (src,index)=>{
        // 拼接输入参数
        const join: ComposeJoin[] = [
            { img: input2, frameData: hugFrameData.self[index] },
            { img: input1, frameData: hugFrameData.user[index] },
            
        ];
        
        // 按顺序等待 compose 操作完成
        const _result = await compose(src, join);
        logger.debug(`[${index + 1}/${srcs.length}]`, `合成完成`);
        result.push(_result);
    })
    // 将合成后的图像序列转换为 GIF
    const gif = await pngs2gif(result);
    return gif;
}

export const loadImg = timeIt(async function loadImg() {
    const imagePath = path.resolve(__dirname, 'images');
    const images = await fs.readdir(imagePath); // 读取目录中的文件

    // 创建一个与文件名相同长度的数组，用于存储图像缓冲区
    const pngBuffers: Buffer[] = new Array(images.length);

    // 使用 Promise.all 并行读取图像，并保留索引顺序
    await Promise.all(
        images.map(async (fileName, index) => {
            if (fileName.endsWith('.png')) {
                const img = path.resolve(imagePath, fileName);
                const imgBuffer = await fs.readFile(img); // 读取文件

                // 使用索引保存缓冲区
                pngBuffers[index] = imgBuffer;
            }
        })
    );

    // 过滤掉任何未定义的元素（非 PNG 文件）
    return pngBuffers.filter(buffer => buffer !== undefined);
})

export default craftHug