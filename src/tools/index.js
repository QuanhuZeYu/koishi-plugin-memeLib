"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tools = void 0;
const imageTools_1 = __importDefault(require("./imageTools"));
const gifTools_1 = __importDefault(require("../tools/gifTools"));
// 圆形裁切工具集
exports.tools = { imageTools: imageTools_1.default, gifTools: gifTools_1.default };
