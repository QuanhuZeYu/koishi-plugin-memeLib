/**
 *
 * @param absPath
 * @returns
 */
declare function loadImageFPath(absPath: string): Promise<Buffer>;
declare function saveImageFBuffer(imgBuf: Buffer, fileName: string): Promise<void>;
/**
 * 输入 图像 Buffer 输出裁切为圆形的图像 Buffer
 * @param imageBuffer
 * @returns
 */
declare function cropToCircle(imageBuffer: Buffer): Promise<Buffer | undefined>;
export declare const imageTools: {
    cropToCircle: typeof cropToCircle;
    loadImageFPath: typeof loadImageFPath;
    saveImageFBuffer: typeof saveImageFBuffer;
};
export {};
