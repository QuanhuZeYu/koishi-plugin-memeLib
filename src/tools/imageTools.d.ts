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
/** 判断是否是png */
declare function isPng(buffer: Buffer): boolean;
/** 判断是否是gif */
declare function isGif(buffer: Buffer): boolean;
/** 判断是否是jpg */
declare function isJpg(buffer: Buffer): boolean;
declare const imageTools: {
    cropToCircle: typeof cropToCircle;
    loadImageFPath: typeof loadImageFPath;
    saveImageFBuffer: typeof saveImageFBuffer;
    isPng: typeof isPng;
    isGif: typeof isGif;
    isJpg: typeof isJpg;
};
export default imageTools;
