/**
 *
 * @param absPath
 * @returns
 */
declare function loadImageFPath(absPath: string): Promise<Buffer>;
/**
 * 异步函数：将图像缓冲区的数据保存为指定文件名的文件
 * @param imgBuf 图像数据的缓冲区对象，通常来自图像处理或转换操作
 * @param fileName 要保存的文件名，包括路径和文件扩展名；即完整路径
 * @returns 无返回值
 *
 * 此函数首先确保文件所在的目录存在，然后尝试将缓冲区数据写入文件
 * 如果写入操作成功，它会在控制台打印成功消息；如果失败，则会打印错误信息并抛出错误
 */
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
