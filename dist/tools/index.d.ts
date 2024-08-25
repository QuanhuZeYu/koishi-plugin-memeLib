import { saveGifToFile } from '@src/tools/gifTools';
export declare const tools: {
    CropToCircle: {
        cropToCircle: (imageBuffer: Buffer) => Promise<Buffer | undefined>;
        loadImageFPath: (absPath: string) => Promise<Buffer>;
        saveImageFBuffer: (imgBuf: Buffer, fileName: string) => Promise<void>;
    };
    saveGifToFile: typeof saveGifToFile;
};
