export declare const MemeGenerator: {
    Petpet: typeof import("./memeGenerator/petpet/FrameData").genPetpetGif;
    tools: {
        imageTools: {
            cropToCircle: (imageBuffer: Buffer) => Promise<Buffer | undefined>;
            loadImageFPath: (absPath: string) => Promise<Buffer>;
            saveImageFBuffer: (imgBuf: Buffer, fileName: string) => Promise<void>;
        };
        saveGifToFile: typeof import("./tools/gifTools").saveGifToFile;
    };
};
