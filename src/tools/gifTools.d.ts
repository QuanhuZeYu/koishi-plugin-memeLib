export interface FrameData {
    x: number;
    y: number;
    width: number;
    height: number;
}
declare function saveGifToFile(gifBuffer: Buffer, outputPath: string): Promise<void>;
export { saveGifToFile };
