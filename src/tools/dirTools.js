"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
function ensureDirectoryExists(dirPath) {
    if (!fs_1.default.existsSync(dirPath)) {
        fs_1.default.mkdirSync(dirPath, { recursive: true });
        console.log(`目录已创建: ${dirPath}`);
    }
    else {
        // console.log(`目录已存在: ${dirPath}`);
    }
}
const dirTools = {
    ensureDirectoryExists
};
exports.default = dirTools;
