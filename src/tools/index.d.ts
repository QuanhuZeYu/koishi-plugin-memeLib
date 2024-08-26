import { saveGifToFile } from '../tools/gifTools';
export declare const tools: {
    imageTools: {
        cropToCircle: (imageBuffer: Buffer) => Promise<Buffer | undefined>;
        loadImageFPath: (absPath: string) => Promise<Buffer>;
        saveImageFBuffer: (imgBuf: Buffer, fileName: string) => Promise<void>;
    };
    saveGifToFile: typeof saveGifToFile;
};
