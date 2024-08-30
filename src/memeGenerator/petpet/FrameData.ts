import path, { resolve } from "node:path";
import fs from 'fs/promises'; // 使用 Promises API 以便使用 async/await
import sharp from "sharp";
import Ffmpeg from "fluent-ffmpeg";
import { PassThrough, Readable } from "stream";

import { FrameData } from "../../tools/gifTools";
import  tools  from "../../tools/index";
import { MY_PLUGIN_DIR } from "src/test";
import { rejects } from "node:assert";
import { WriteStream } from "node:fs";
import { Stream } from "node:stream";

const petFps = 15;
const frameTime = 15 / 1000;
const frameCounts = 5;

export const BASE_DATA = { petFps, frameTime, frameCounts };
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
 * @param inputImg - 原始输入图片数据
 * @param handImg - 背景图片数据
 * @param frame - 包含缩放和合成参数的对象
 * @returns 合成后的图片数据（Buffer）
 */
export async function createFrame(
    inputImg: Buffer,
    handImg: Buffer,
    frame: FrameData,
    option: createFrameOption = {
        blend: 'dest-over',
    }
): Promise<Buffer | void> {
    // 输入验证
    if (!Buffer.isBuffer(inputImg) || !Buffer.isBuffer(handImg)) {
        throw new Error('输入的图像数据必须是 Buffer 类型');
    }

    if (
        typeof frame.width !== 'number' ||
        typeof frame.height !== 'number' ||
        typeof frame.x !== 'number' ||
        typeof frame.y !== 'number'
    ) {
        throw new Error('FrameData 参数无效，必须包含数字类型的 width、height、x 和 y 属性');
    }

    try {
        // 确保输入图片透明背景
        const resizedInputImg = await sharp(inputImg)
            .resize(frame.width, frame.height) // 确保背景透明
            .png().toBuffer();

        // 合成图像
        return await sharp(handImg)
            .composite([
                {
                    input: resizedInputImg,
                    left: frame.x,
                    top: frame.y,
                    blend: option.blend,
                },
            ])
            .png().toBuffer();
    } catch (err) {
        // 错误处理
        console.error('创建帧时发生错误:', err);
        throw err;
    }
}


async function retryCreateFrame(
    input: Buffer,
    hand: Buffer,
    frameData: FrameData,
    inputArray?: Buffer[],
    inputIndex?: number,
    maxRetries: number = 4
): Promise<Buffer|void> {
    let lastError: Error | null = null;

    // 如果没有提供输入数组或索引，则直接调用 createFrame
    if (!inputArray || inputIndex === undefined) {
        return createFrame(input, hand, frameData);
    }

    // 记录初始索引位置
    let currentIndex = inputIndex;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            // 使用当前的索引从输入数组中选择新的输入
            const currentInput = inputArray[currentIndex];

            // 尝试创建帧
            return await createFrame(currentInput, hand, frameData);
        } catch (error) {
            lastError = error as Error;
            console.error(`第 ${attempt + 1} 次尝试失败`);
            
            // 根据尝试次数来调整索引
            if (attempt < maxRetries - 1) {
                // 在前后尝试不同的输入
                currentIndex = inputIndex + (attempt % 2 === 0 ? -(attempt / 2) : (attempt + 1) / 2);

                // 保持索引在数组范围内
                currentIndex = Math.max(0, Math.min(inputArray.length - 1, currentIndex));

                // 如果还可以重试，则等待一会儿再重试
                await new Promise(resolve => setTimeout(resolve, 1000)); // 等待 1 秒
            }
        }
    }

    // 所有尝试都失败了，抛出最后一次捕获的错误
    throw new Error(`所有重试均失败: ${lastError?.message || '未知错误'}`);
}


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
export async function loadHandImages(): Promise<Buffer[]> {
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
                console.error(`读取图像 ${file} 时发生错误: ${err}`);
                throw err; // 捕获错误后抛出，保证调用者能处理
            }
        });

        // 等待所有图像加载完成
        return await Promise.all(imagePromises);
    } catch (err) {
        console.error(`读取目录 ${dir} 时发生错误: ${err}`);
        throw err;
    }
}

function generateGif(frameBuffers: Buffer[], fps?: number): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const buffers = new Stream.Writable();
        const petFps = fps ? fps : BASE_DATA.petFps;
        const command = Ffmpeg();

        // 将 frameBuffers 转换成 Readable 流，并添加到 ffmpeg 命令中
        const readable = new Readable();
        frameBuffers.forEach((buf, i) => {
            readable.push(buf);
        });
        readable.push(null); // 表示流结束
        command.addInput(readable);

        // 捕获输出数据到 Buffer
        let data: Uint8Array[] = [];
        buffers._write = (chunk, encoding, done) => {
            data.push(chunk);
            done();
        };

        command
            .addOptions([
                `-filter_complex`, 
                `[0:v] fps=${petFps},scale=320:-1:flags=lanczos [scaled]; [scaled] palettegen [palette]; [0:v][palette] paletteuse`
            ])
            .on('end', () => {
                console.log('GIF 生成成功');
                resolve(Buffer.concat(data)); // 将所有输出数据拼接为一个完整的 Buffer
            })
            .on('error', (err) => {
                console.error('GIF 生成失败:', err);
                reject(err);
            })
            .inputFPS(petFps)
            .outputOptions(
                '-loop', '0' // 无限循环
            )
            .toFormat('gif')
            .pipe(buffers);
    });
}

/**
 * 异步函数：生成动图GIF
 * @param inputImg 图像缓冲区，单张图片或者是GIF
 * @returns 返回一个Promise，解析为包含GIF图像的缓冲区，如果发生错误则可能返回void
 * 
 * 此函数负责生成一个动图GIF它首先加载手部图像，然后为每一帧创建相应的缓冲区图像，
 * 最后将所有帧合并生成GIF图像如果在生成过程中发生错误，会抛出异常并打印错误信息
 */
async function genPetpetGif(inputImg: Buffer, isGif: boolean = false): Promise<Buffer|void> {
    if (!isGif) {
        try {
            const hands: Buffer[] = await loadHandImages();
            
            const frameBuffers = await Promise.all(
                frames.map((frameData, index) =>
                    createFrame(inputImg, hands[index], frameData)
                )
            );
            if (frameBuffers.every(buffer => buffer instanceof Buffer)){
                return await generateGif(frameBuffers);
            }
            // else {
            //     throw new Error("生成 GIF 时发生错误");
            // }
        } catch (err) {
            console.error("生成 GIF 时发生错误[1]:", err);
            throw err;
        }
    } else if (isGif) {
        // try {
        const handImgs = BASE_DATA.frameCounts;
        let _b = false
        let oldInputs:Buffer[] = []
        let inputCounts:number = 0;
        while(_b === false) {
            oldInputs = await tools.gifTools.extractGifFramesFromBuffer(inputImg, undefined, 15) as Buffer[];
            inputCounts = oldInputs.length;
            _b = tools.imageTools.isPng(oldInputs[inputCounts-1])
            // console.log(`最后一帧是否为Png:${_b}`)
        }
        // 深拷贝 oldInputs
        const cloneInput = oldInputs.map(buffer => Buffer.from(buffer));
        // 检测最后一帧是否为png
        // console.log(`克隆数组最后一帧PNG:${tools.imageTools.isPng(cloneInput[cloneInput.length-1])}`)
        // for (let i = 0; i < handImgs; i++) {
        //     console.log(`input${i} type:${typeof oldInputs[i]}`)  // 调试信息
        // }
        const targetCount = Math.abs(handImgs * inputCounts) / gcd(handImgs, inputCounts);

        const newFrames = (): FrameData[] => {
            const forTime = targetCount / handImgs;
            const newFrames: FrameData[] = [];
            for (let i = 0; i < forTime; i++) {
                newFrames.push(...frames);
            }
            return newFrames;
        };
        const _newFrames: FrameData[] = newFrames();

        // console.log(`目标帧数: ${targetCount}`);
        const hands: Buffer[] = await loadHandImages();
        // console.log(`加载手部图像完成: ${hands.length}`);
        const frameBuffers = await Promise.all(
            _newFrames.map((frameData, index) => {
                const handValue = index % handImgs;
                const inputValue = index % inputCounts;
                // console.log(`handValue: ${handValue}, inputValue: ${inputValue}`);
                if (!cloneInput[inputValue] || !hands[handValue] || !frameData) {
                    console.error(`无效的数据: index=${index}, handValue=${handValue}`);
                    throw new Error(`无效的数据: index=${index}, handValue=${handValue}`);
                }
                // console.log(`正在处理第 ${index} 帧，目标帧数: ${targetCount}`);
                try{
                    // console.log(`克隆数组最后一帧PNG:${tools.imageTools.isPng(cloneInput[cloneInput.length-1])}`)
                    return retryCreateFrame(
                        cloneInput[inputValue], 
                        hands[handValue], 
                        frameData, 
                        cloneInput, 
                        inputValue)
                } catch (error) {
                    console.error(`处理第 ${index} 帧时发生错误，重试中...`);
                    // 如果创建帧时发生错误，则重试
                }
            })
        );
        // console.log('所有帧处理完成');
        if (frameBuffers.every(item => item instanceof Buffer)) {
            // 检查帧是否为透明图像 - 结论 是
            // const savePath = path.join(MY_PLUGIN_DIR, '../out');
            // frameBuffers.map((buffer, i)=>{
            //     tools.imageTools.saveImageFBuffer(buffer, path.join(savePath, `frame${i}.png`))
            // })    
            return await generateGif(frameBuffers)
        }
        else {
            throw new Error("生成 GIF 时发生错误[2]");
        }
        // } catch (err) {
        //     console.error("处理 GIF 时发生错误:", err);
        //     throw err;
        // }

    }
}

export { genPetpetGif };



// 工具函数区
function gcd(a: number, b: number): number {
    // 使用欧几里得算法计算最大公约数
    return b === 0 ? a : gcd(b, a % b);
}