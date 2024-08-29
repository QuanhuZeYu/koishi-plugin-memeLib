"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const imageTools_1 = __importDefault(require("./imageTools"));
const gifTools_1 = __importDefault(require("./gifTools"));
const dirTools_1 = __importDefault(require("./dirTools"));
// 圆形裁切工具集
const tools = { imageTools: imageTools_1.default, gifTools: gifTools_1.default, dirTools: dirTools_1.default };
exports.default = tools;
