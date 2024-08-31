import fs from 'node:fs'
import path from "node:path";
import * as _canvaGif from "@canvacord/gif";
import  logger  from "../tools/logger";
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
 * @param target 
 * @param input 
 * @returns [Buffer[],Buffer[],number] 第一个参数是目标帧数组，第二个参数是输入帧数组，第三个是目标帧循环次数
 */
async function align2Gif(target: Buffer|Buffer[], input: Buffer):Promise<[Buffer[],Buffer[],number]> {
    let targets:Buffer[]
    if (Array.isArray(target)){
        targets = target
    } else {
        targets = await extraGIF(target)
    }  // 处理target的两种输入情况
    ; // 提取目标 GIF 的 png 序列
    let inputs:Buffer[] = await extraGIF(input);   // 提取输入 GIF 的 png 序列

    const targetFramesCount = targets.length;
    const inputFramesCount = inputs.length;

    // 如果输入帧数已经与目标帧数一致，直接返回
    if (inputFramesCount === targetFramesCount) {
        return [targets,inputs,1]
    }

    // 如果目标帧数较小，需要倍化目标帧
    let rt:number = 1  // 倍数，默认是1，只有有目标帧数较小时，才需要倍化
    let alignedTargets: Buffer[] = [];
    if (targetFramesCount < inputFramesCount) {
        rt = Math.ceil(inputFramesCount / targetFramesCount);
        for (let i = 0; i < rt; i++) {
            alignedTargets = alignedTargets.concat(targets);
        }
        alignedTargets = alignedTargets.slice(0, inputFramesCount); // 修正长度以匹配输入帧数
        targets = alignedTargets;
    } else {
        // DO NOTHING
    }

    // 进行抽帧，如果输入帧数比目标帧数多
    let alignedInputs: Buffer[] = [];
    if (inputFramesCount > alignedTargets.length) {
        // 保留头和尾的帧
        alignedInputs.push(inputs[0]); // 添加第一个帧
        alignedInputs.push(inputs[inputs.length - 1]); // 添加最后一个帧

        // 计算需要抽取的帧数量
        let framesToRemove = inputFramesCount - targetFramesCount;
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

    // 最终保证两者帧数一致
    return [targets,inputs,rt]
}


const gifTools = { 
    saveGifToFile,extraGIF,align2Gif
}

export default gifTools