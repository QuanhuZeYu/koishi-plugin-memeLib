export declare const tools: {
    imageTools: {
        cropToCircle: (imageBuffer: Buffer) => Promise<Buffer | undefined>;
        loadImageFPath: (absPath: string) => Promise<Buffer>;
        saveImageFBuffer: (imgBuf: Buffer, fileName: string) => Promise<void>;
        isPng: (buffer: Buffer) => boolean;
        isGif: (buffer: Buffer) => boolean;
        isJpg: (buffer: Buffer) => boolean;
    };
    gifTools: {
        saveGifToFile: (gifBuffer: Buffer, outputPath: string) => Promise<void>;
        extractGifFramesFromBuffer: (gifBuffer: Buffer, outputDir: string) => Promise<void>;
    };
};
