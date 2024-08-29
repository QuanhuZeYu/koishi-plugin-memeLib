import path from "node:path";

import { FrameData } from "../../tools/gifTools";
import sharp from "sharp";
import Ffmpeg from "fluent-ffmpeg";
import { PassThrough, Readable } from "stream";
import  tools  from "src/tools";

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
async function createFrame(
    inputImg: Buffer,
    handImg: Buffer,
    frame: FrameData,
    option: createFrameOption = {
        blend: "dest-over",
    }
): Promise<Buffer> {
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
        // 缩放输入图片并合成到背景图片
        const resizedInputImg = await sharp(inputImg)
            .resize(frame.width, frame.height)
            .toBuffer();

        return await sharp(handImg)
            .composite([
                {
                    input: resizedInputImg,
                    left: frame.x,
                    top: frame.y,
                    blend: option.blend,
                },
            ])
            .toBuffer();

    } catch (err) {
        console.error('创建帧时发生错误:', err);
        const bo = tools.imageTools.isPng(inputImg)
        const bo2 = tools.imageTools.isJpg(inputImg)
        const ho = tools.imageTools.isPng(handImg)
        // console.log(`是否为png 输入:${bo}, 原图:${ho}; 输入Jpg:${bo2}`)
        throw err;
    }
}


async function retryCreateFrame(
    input: Buffer,
    hand: Buffer,
    frameData: FrameData,
    inputArray?: Buffer[],
    inputIndex?: number,
    maxRetries: number = 10
): Promise<Buffer> {
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
            console.error(`第 ${attempt + 1} 次尝试失败，错误: ${lastError.message}`);
            
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
async function loadHandImages(frames: FrameData[]): Promise<Buffer[]> {
    // 使用Promise.all并行读取所有图像，以提高加载效率
    return Promise.all(
        frames.map((_, index) =>
            // 使用sharp读取图像文件，并将其转换为Buffer
            sharp(path.join(__dirname, `images/${index}.png`))
                .toBuffer()
                .catch((err) => {
                    // 捕获并打印任何读取图像时发生的错误
                    console.error(`读取图像时发生错误: ${err}`);
                    throw err;
                })
        )
    );
}


/**
 * 根据帧缓冲区数组生成 GIF 图片的 Promise 函数
 * @param frameBuffers 帧缓冲区数组，包含了一系列的图像帧数据
 * @returns 返回一个 Promise， resolves 为最终生成的 GIF 图片的 Buffer 对象
 */
function generateGif(frameBuffers: Buffer[]): Promise<Buffer> {
    // 创建一个 PassThrough 流，用于传输 GIF 数据
    const outStream = new PassThrough();
    // 存储 GIF 数据块的数组
    const buffers: Buffer[] = [];

    // 返回一个 Promise，用于处理异步的 GIF 生成过程
    return new Promise<Buffer>((resolve, reject) => {
        // 创建一个 Ffmpeg 转码任务
        Ffmpeg()
            .input(
                new Readable({
                    // 读取 frameBuffers 中的每一帧数据
                    read() {
                        for (const buffer of frameBuffers) {
                            this.push(buffer);
                        }
                        // 读取结束
                        this.push(null);
                    }
                })
            )
            .inputFormat("image2pipe") // 设置输入格式为 image2pipe，表示通过管道传递图像数据
            .inputFPS(BASE_DATA.petFps) // 设置输入帧率
            .outputOptions("-vf", `fps=${BASE_DATA.petFps}`) // 输出视频过滤器，调整帧率
            .toFormat("gif") // 转换输出格式为 gif
            .pipe(outStream) // 将处理后的数据传输到 outStream
            .on("error", reject); // 处理错误事件，如果发生错误则调用 reject

        // 监听 outStream 的 data 事件，将数据块存储到 buffers 数组中
        outStream.on("data", (chunk) => buffers.push(chunk));
        // 监听 outStream 的 end 事件，当数据传输结束时，将存储的所有数据块合并成一个 Buffer 并 resolve
        outStream.on("end", () => resolve(Buffer.concat(buffers)));
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
async function genPetpetGif(inputImg: Buffer, isGif: boolean = false): Promise<Buffer | void> {
    if (!isGif) {
        try {
            const hands: Buffer[] = await loadHandImages(frames);
            
            const frameBuffers = await Promise.all(
                frames.map((frameData, index) =>
                    createFrame(inputImg, hands[index], frameData)
                )
            );
            
            return await generateGif(frameBuffers);
        } catch (err) {
            console.error("生成 GIF 时发生错误:", err);
            throw err;
        }
    } else if (isGif) {
        try {
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
            const hands: Buffer[] = await loadHandImages(frames);
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
                return await generateGif(frameBuffers);
            }
            else {
                throw new Error("生成 GIF 时发生错误");
            }
        } catch (err) {
            console.error("处理 GIF 时发生错误:", err);
            throw err;
        }

    }
}

export { genPetpetGif };



// 工具函数区
function gcd(a: number, b: number): number {
    // 使用欧几里得算法计算最大公约数
    return b === 0 ? a : gcd(b, a % b);
}