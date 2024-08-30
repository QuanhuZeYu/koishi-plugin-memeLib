import { FrameData } from "../../tools/gifTools";
export declare const BASE_DATA: {
    petFps: number;
    frameTime: number;
    frameCounts: number;
};
export declare const frames: FrameData[];
export interface createFrameOption {
    blend: "clear" | "source" | "over" | "in" | "out" | "atop" | "dest" | "dest-over" | "dest-in" | "dest-out" | "dest-atop" | "xor" | "add" | "saturate" | "multiply" | "screen" | "overlay" | "darken" | "lighten" | "color-dodge" | "colour-dodge" | "color-burn" | "colour-burn" | "hard-light" | "soft-light" | "difference" | "exclusion";
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
export declare function createFrame(inputImg: Buffer, handImg: Buffer, frame: FrameData, option?: createFrameOption): Promise<Buffer | void>;
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
export declare function loadHandImages(): Promise<Buffer[]>;
/**
 * 异步函数：生成动图GIF
 * @param inputImg 图像缓冲区，单张图片或者是GIF
 * @returns 返回一个Promise，解析为包含GIF图像的缓冲区，如果发生错误则可能返回void
 *
 * 此函数负责生成一个动图GIF它首先加载手部图像，然后为每一帧创建相应的缓冲区图像，
 * 最后将所有帧合并生成GIF图像如果在生成过程中发生错误，会抛出异常并打印错误信息
 */
declare function genPetpetGif(inputImg: Buffer, isGif?: boolean): Promise<Buffer | void>;
export { genPetpetGif };
