"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const node_util_1 = require("node:util");
const node_child_process_1 = require("node:child_process");
const index_1 = require("./tools/index");
const CTC = index_1.tools.imageTools;
const saveGifToFile = index_1.tools.saveGifToFile;
const index_2 = require("./memeGenerator/petpet/index");
const BASE_DIR = __dirname;
const execAsync = (0, node_util_1.promisify)(node_child_process_1.exec);
async function test() {
    // const input = path.join(BASE_DIR, 'test.jpg')
    // const outpt = path.join(BASE_DIR, 'outpt.png')
    // const inBuf = CTC.loadImageFPath(input)
    // const outBuf = await CTC.cropToCircle(await inBuf)
    // if (outBuf instanceof Buffer) {
    //   await CTC.saveImageFBuffer(outBuf, path.join(BASE_DIR, 'out.png'))
    // }
    const ava = await CTC.loadImageFPath(node_path_1.default.join(__dirname, `test.jpg`));
    const cirAva = await CTC.cropToCircle(ava);
    if (cirAva instanceof Buffer) {
        const result = await index_2.Petpet.genPetpetGif(cirAva);
        if (result instanceof Buffer) {
            console.log(`生成成功，GIF大小:${result.length}`);
            saveGifToFile(result, node_path_1.default.join(__dirname, 'out/output.gif'));
        }
    }
}
test();
