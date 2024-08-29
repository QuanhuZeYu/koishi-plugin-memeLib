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
 * 异步函数：生成动图GIF
 * @param inputImg 图像缓冲区，单张图片或者是GIF
 * @returns 返回一个Promise，解析为包含GIF图像的缓冲区，如果发生错误则可能返回void
 *
 * 此函数负责生成一个动图GIF它首先加载手部图像，然后为每一帧创建相应的缓冲区图像，
 * 最后将所有帧合并生成GIF图像如果在生成过程中发生错误，会抛出异常并打印错误信息
 */
declare function genPetpetGif(inputImg: Buffer, isGif?: boolean): Promise<Buffer | void>;
export { genPetpetGif };
