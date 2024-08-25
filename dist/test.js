"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const child_process_1 = require("child_process");
const tools_1 = require("@src/tools");
const CTC = tools_1.tools.CropToCircle;
const saveGifToFile = tools_1.tools.saveGifToFile;
const petpet_1 = require("@src/memeGenerator/petpet");
const BASE_DIR = __dirname;
const execAsync = (0, util_1.promisify)(child_process_1.exec);
async function test() {
    // const input = path.join(BASE_DIR, 'test.jpg')
    // const outpt = path.join(BASE_DIR, 'outpt.png')
    // const inBuf = CTC.loadImageFPath(input)
    // const outBuf = await CTC.cropToCircle(await inBuf)
    // if (outBuf instanceof Buffer) {
    //   await CTC.saveImageFBuffer(outBuf, path.join(BASE_DIR, 'out.png'))
    // }
    const ava = await CTC.loadImageFPath(path_1.default.join(__dirname, `test.jpg`));
    const cirAva = await CTC.cropToCircle(ava);
    if (cirAva instanceof Buffer) {
        const result = await petpet_1.Petpet.genPetpetGif(cirAva);
        if (result instanceof Buffer) {
            console.log(`生成成功，GIF大小:${result.length}`);
            saveGifToFile(result, path_1.default.join(__dirname, 'out/output.gif'));
        }
    }
}
test();
