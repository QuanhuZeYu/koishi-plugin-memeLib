export interface FrameData {
    x: number;
    y: number;
    width: number;
    height: number;
}
/**
 * 检查并创建输出路径
 * @param dirPath 要检查或创建的目录路径
 */
declare function saveGifToFile(gifBuffer: Buffer, outputPath: string): Promise<void>;
declare function extractGifFramesFromBuffer(gifBuffer: Buffer, outputDir?: string, fps?: number): Promise<void | Buffer[]>;
declare const gifTools: {
    saveGifToFile: typeof saveGifToFile;
    extractGifFramesFromBuffer: typeof extractGifFramesFromBuffer;
};
export default gifTools;
