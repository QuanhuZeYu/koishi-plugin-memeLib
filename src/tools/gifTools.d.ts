export interface FrameData {
    x: number;
    y: number;
    width: number;
    height: number;
}
declare function saveGifToFile(gifBuffer: Buffer, outputPath: string): Promise<void>;
declare function extractGifFramesFromBuffer(gifBuffer: Buffer, outputDir: string): Promise<void>;
declare const gifTools: {
    saveGifToFile: typeof saveGifToFile;
    extractGifFramesFromBuffer: typeof extractGifFramesFromBuffer;
};
export default gifTools;
