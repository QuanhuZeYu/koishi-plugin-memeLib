import fs from 'node:fs'
import path from "node:path";
import * as _canvaGif from "@canvacord/gif";
import  logger  from "../tools/logger";
import GIFEncoder from 'gifencoder';
import { Canvas, createCanvas, loadImage } from 'canvas';
import { BASE_DATA, Base_GifQuality } from '../interface/BASE_DATA';
import { Readable, Stream } from 'node:stream';
import  concat  from 'concat-stream'
import Ffmpeg from 'fluent-ffmpeg';
import { ComposeJoin, createFrameOption, FrameData, GifQuality } from '../interface/InterfaceData';
import { getSharp } from '../context';

// import gifFrames from 'gif-frames';


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
        // logger.info(`GIF 已保存到 ${resolvedPath}`);
    } catch (error: any) {
        logger.error('保存 GIF 时发生错误:', error.message);
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
    logger.info(`共提取${frames.length}帧`)
    return Promise.all(promiseBufs)
}


/**
 * 对齐方式为倍化目标，抽帧输入，两种方式同时进行
 * 返回已经对齐的两个数组，并附带一个目标GIF循环次数统计
 * 1.如果输入帧过小，倍化输入帧，不进行对齐，直到大于等于目标帧数，不记录倍化的次数
 * 2.如果目标帧过小，倍化目标帧，不进行对齐，直到大于等于输入帧数，并且记录倍化次数
 * 3.对输入帧进行抽帧，直到与目标帧数一致，抽帧方式为保留头尾帧，然后通过二分法均匀抽取
 * @param target 
 * @param input 
 * @returns [Buffer[],Buffer[],number] 第一个参数是目标帧数组，第二个参数是输入帧数组，第三个是目标帧循环次数
 */
async function align2Gif(target: Buffer | Buffer[], input: Buffer): Promise<[Buffer[], Buffer[], number]> {
    // 处理target的两种输入情况，提取目标 GIF 的 png 序列
    let targets: Buffer[];
    if (Array.isArray(target)) {
        targets = target;
    } else {
        targets = await extraGIF(target);
    }
    let inputs: Buffer[] = await extraGIF(input); // 提取输入 GIF 的 png 序列

    const targetFramesCount = targets.length;
    const inputFramesCount = inputs.length;

    // 如果输入帧数已经与目标帧数一致，直接返回
    if (inputFramesCount === targetFramesCount) {
        return [targets, inputs, 1];
    }

    // 如果输入帧过小，需要倍化输入帧
    if (inputFramesCount < targetFramesCount) {
        const multiplier = Math.ceil(targetFramesCount / inputFramesCount);
        inputs = Array.from({ length: targetFramesCount }, (_, i) => inputs[i % inputFramesCount]);
    }

    // 如果目标帧数较小，需要倍化目标帧
    let rt = 1; // 倍数，只有目标帧数较小时，才需要倍化
    if (targetFramesCount < inputs.length) {
        rt = Math.ceil(inputs.length / targetFramesCount);
        targets = Array.from({ length: rt * targetFramesCount }, (_, i) => targets[i % targetFramesCount]);
        targets = targets.slice(0, inputs.length); // 修正长度以匹配输入帧数
    }

    // 进行抽帧，如果输入帧数比目标帧数多
    if (inputs.length > targets.length) {
        const alignedInputs: Buffer[] = [inputs[0], inputs[inputs.length - 1]]; // 保留头和尾的帧

        let framesToRemove = inputs.length - targets.length;
        let left = 1; // 从第二帧开始（已经保留了第一帧）
        let right = inputs.length - 2; // 到倒数第二帧结束（已经保留了最后一帧）

        // 使用二分法来抽取中间的帧
        while (framesToRemove > 0 && left <= right) {
            const middle = Math.floor((left + right) / 2);
            if (!alignedInputs.includes(inputs[middle])) {
                alignedInputs.push(inputs[middle]);
                framesToRemove--;
            }

            if (framesToRemove > 0) {
                if (alignedInputs.length % 2 === 0) {
                    right--; // 从右侧移除
                } else {
                    left++; // 从左侧移除
                }
            }
        }

        // 按原顺序排序抽取的帧
        alignedInputs.sort((a, b) => inputs.indexOf(a) - inputs.indexOf(b));
        inputs = alignedInputs;
    }

    // 最终保证两者帧数一致
    return [targets, inputs, rt];
}

/**
 * 
 * @param target1 
 * @param target2 
 * @param input 
 * @returns 
 */
async function align3Gif(
    target1: Buffer | Buffer[],
    target2: Buffer | Buffer[],
    input: Buffer
  ): Promise<[Buffer[], Buffer[], Buffer[], number]> {
    // 处理 target1 和 target2 的两种输入情况（Buffer 或 Buffer 数组）
    let targets1: Buffer[] = Array.isArray(target1) ? target1 : await extraGIF(target1);
    let targets2: Buffer[] = Array.isArray(target2) ? target2 : await extraGIF(target2);
  
    // 提取输入 GIF 的 png 序列
    let inputs: Buffer[] = await extraGIF(input);
  
    const target1FramesCount = targets1.length;
    const target2FramesCount = targets2.length;
    const inputFramesCount = inputs.length;
  
    // 如果所有输入的帧数已经一致，直接返回
    if (inputFramesCount === target1FramesCount && inputFramesCount === target2FramesCount) {
      return [targets1, targets2, inputs, 1];
    }
  
    // 如果目标帧数较小，需要倍化目标帧
    let rt: number = 1; // 倍数，默认是1，只有有目标帧数较小时，才需要倍化
    let alignedTargets1: Buffer[] = [];
    let alignedTargets2: Buffer[] = [];
  
    // 确定最大的帧数
    const maxFramesCount = Math.max(target1FramesCount, target2FramesCount, inputFramesCount);
  
    // 处理 target1 的帧数
    if (target1FramesCount < maxFramesCount) {
      rt = Math.ceil(maxFramesCount / target1FramesCount);
      for (let i = 0; i < rt; i++) {
        alignedTargets1 = alignedTargets1.concat(targets1);
      }
      alignedTargets1 = alignedTargets1.slice(0, maxFramesCount); // 修正长度以匹配最大帧数
      targets1 = alignedTargets1;
    }
  
    // 处理 target2 的帧数
    if (target2FramesCount < maxFramesCount) {
      rt = Math.ceil(maxFramesCount / target2FramesCount);
      for (let i = 0; i < rt; i++) {
        alignedTargets2 = alignedTargets2.concat(targets2);
      }
      alignedTargets2 = alignedTargets2.slice(0, maxFramesCount); // 修正长度以匹配最大帧数
      targets2 = alignedTargets2;
    }
  
    // 处理 input 的帧数
    let alignedInputs: Buffer[] = [];
    if (inputFramesCount > maxFramesCount) {
      // 保留头和尾的帧
      alignedInputs.push(inputs[0]); // 添加第一个帧
      alignedInputs.push(inputs[inputs.length - 1]); // 添加最后一个帧
  
      // 计算需要抽取的帧数量
      let framesToRemove = inputFramesCount - maxFramesCount;
      let left = 1; // 从第二帧开始（已经保留了第一帧）
      let right = inputs.length - 2; // 到倒数第二帧结束（已经保留了最后一帧）
  
      // 使用二分法来抽取中间的帧
      while (framesToRemove > 0 && left <= right) {
        const middle = Math.floor((left + right) / 2);
        if (!alignedInputs.includes(inputs[middle])) {
          alignedInputs.push(inputs[middle]);
          framesToRemove--;
        }
  
        if (framesToRemove > 0) {
          if (alignedInputs.length % 2 === 0) {
            right--; // 从右侧移除
          } else {
            left++; // 从左侧移除
          }
        }
      }
  
      // 按原顺序排序抽取的帧
      alignedInputs.sort((a, b) => inputs.indexOf(a) - inputs.indexOf(b));
      inputs = alignedInputs;
    } else {
      // DO NOTHING
    }
  
    // 最终保证所有 GIF 帧数一致
    return [targets1, targets2, inputs, rt];
}


async function pngsToGifBuffer_canvas(pngBuffers: Buffer[], gifData: { gifWidth: number, gifHeigh: number }, fps?: number): Promise<Buffer> {
    fps = fps ? fps : BASE_DATA.baseFps;
    const delay = Math.round(1000 / fps);
    const encoder = new GIFEncoder(gifData.gifWidth, gifData.gifHeigh);
    const canvas = createCanvas(gifData.gifWidth, gifData.gifHeigh);
    const ctx = canvas.getContext('2d');

    return new Promise((resolve, reject) => {
        encoder.start();
        encoder.setRepeat(0); // 0 为无限循环
        encoder.setDelay(delay); // 每帧之间的延迟（毫秒）
        encoder.setQuality(1); // 设置 GIF 的质量（1-30，1 最高）
        encoder.setTransparent(0x00FF00FF); // 设置透明背景的颜色（这里使用了一个透明的颜色）

        const gifStream = encoder.createReadStream();
        gifStream.pipe(concat({ encoding: 'buffer' }, resolve));

        (async () => {
            try {
                for (const buffer of pngBuffers) {
                    const img = await loadImage(buffer);
                    
                    // 在绘制每一帧之前清空画布
                    ctx.clearRect(0, 0, gifData.gifWidth, gifData.gifHeigh);

                    ctx.drawImage(img, 0, 0, gifData.gifWidth, gifData.gifHeigh);
                    encoder.addFrame(ctx as any);
                }
                encoder.finish();
            } catch (error) {
                reject(error);
            }
        })();
    });
}


async function pngsToGifBuffer_ffmpeg(pngBuffers:Buffer[],fps?:number,quality?:GifQuality):Promise<Buffer> {
    const petFps = fps || BASE_DATA.baseFps;
    const max_colors = quality?.color || Base_GifQuality.medium.color
    const bay = quality?.bayer_scale || Base_GifQuality.medium.bayer_scale
    
    
    const command = Ffmpeg();
    // 创建 PassThrough 流用于 Buffer 数据传递
    const readable = new Readable({
        read() {
            const concatenatedBuffer = Buffer.concat(pngBuffers); // 合并所有缓冲区
            this.push(concatenatedBuffer); // 推入合并后的缓冲区
            this.push(null); // 表示流结束
        }
    });

    // 创建 PassThrough 流用于 Buffer 数据输出
    const passThrough = new Stream.PassThrough();
    const data: Uint8Array[] = [];
    
    return new Promise((resolve, reject) => {
        passThrough.on('data', (chunk) => {
            data.push(chunk);
        });

        passThrough.on('end', () => {
            logger.info('GIF 生成成功');
            resolve(Buffer.concat(data)); // 将所有输出数据拼接为一个完整的 Buffer
        });

        passThrough.on('error', (err) => {
            logger.error('GIF 生成失败:', err);
            reject(err);
        });

        // 配置 ffmpeg 命令
        command
            .addInput(readable)
            .inputFPS(petFps)
            .addOptions([
                `-filter_complex`, 
                // `[0:v] fps=${petFps},scale=320:-1:flags=lanczos [scaled]; [scaled] palettegen [palette]; [0:v][palette] paletteuse`
                `[0:v] fps=${petFps},scale=320:-1:flags=lanczos [scaled]; [scaled] palettegen=max_colors=${max_colors} [palette]; [0:v][palette] paletteuse=dither=bayer:bayer_scale=${bay}:diff_mode=rectangle`
            ])
            .outputOptions('-loop', '0') // 无限循环
            .toFormat('gif')
            .pipe(passThrough); // 直接传递数据
    });
}


async function compose(src: Buffer, join: ComposeJoin[]): Promise<Buffer> {
    const sharp = getSharp()
    let curImg = src; // 当前图像
    const background = {background:{r:0,g:0,b:0,alpha:0}}
    // 遍历数组
    for (const [index,obj] of join.entries()) {
        // 每个数组下的对象处理
        let img = obj.img
        const frame = obj.frameData
        img = await sharp(img).resize(frame.width,frame.height,background).rotate(frame.rotate||0,background).png().toBuffer()
        curImg = await sharp(curImg)
            .composite([{
                input:img,
                left:frame.x,
                top:frame.y,
                blend:frame.blendOption as any||"dest-over"
            }])
            .png().toBuffer()
    }
    return curImg
}


const gifTools = { 
    saveGifToFile,extraGIF,align2Gif,align3Gif,
    pngsToGifBuffer_canvas,pngsToGifBuffer_ffmpeg,compose
}

export default gifTools


// region 私有函数区
// 判断传入的所有参数是否是Buffer类型
function allIsBuffer(...args:Buffer[]) {
    return args.every(arg => arg instanceof Buffer)
}

const _isBuffer = Buffer.isBuffer