"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genPetpetGif = genPetpetGif;
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const stream_1 = require("stream");
// 逐帧合成 - 单步函数
async function createFrame(inputImg, handImg, frame) {
    // 处理头像图像，调整大小
    const avatar = await (0, sharp_1.default)(inputImg)
        .resize(frame.width, frame.height).toBuffer();
    // 处理手部图像，调整大小
    const hand = await (0, sharp_1.default)(handImg).toBuffer();
    const frameBuffer = await (0, sharp_1.default)(hand)
        .composite([{
            input: avatar,
            left: frame.x,
            top: frame.y,
            blend: "dest-over"
        }])
        .toBuffer();
    return frameBuffer;
}
async function genPetpetGif(inputImg) {
    // 定义帧数据
    const frames = [
        { x: 14, y: 20, width: 98, height: 98 },
        { x: 12, y: 33, width: 101, height: 85 },
        { x: 8, y: 40, width: 110, height: 76 },
        { x: 10, y: 33, width: 102, height: 84 },
        { x: 12, y: 20, width: 98, height: 98 },
    ];
    try {
        // 读取手部图像
        const hands = await Promise.all(frames.map(async (_, index) => {
            try {
                return await (0, sharp_1.default)(path_1.default.join(__dirname, `images/${index}.png`)).toBuffer();
            }
            catch (err) {
                console.error(`读取图像时发生错误: ${err}`);
                throw err;
            }
        }));
        // 合成手和头像
        const frameBuffers = await Promise.all(frames.map((frameData, index) => createFrame(inputImg, hands[index], frameData)));
        const outStream = new stream_1.PassThrough();
        const buffers = [];
        return new Promise((resolve, reject) => {
            (0, fluent_ffmpeg_1.default)()
                .input(new stream_1.Readable({
                read() {
                    for (const buffer of frameBuffers) {
                        this.push(buffer);
                    }
                    this.push(null);
                }
            }))
                .inputFormat('image2pipe')
                .inputFPS(15)
                .outputOptions('-vf', 'fps=15')
                .toFormat('gif')
                .pipe(outStream)
                .on('error', reject);
            outStream.on('data', (chunk) => buffers.push(chunk));
            outStream.on('end', () => resolve(Buffer.concat(buffers)));
        });
    }
    catch (err) {
        console.error('生成 GIF 时发生错误:', err);
        throw err;
    }
}
