declare function ensureDirectoryExists(dirPath: string): void;
declare const dirTools: {
    ensureDirectoryExists: typeof ensureDirectoryExists;
};
export default dirTools;
