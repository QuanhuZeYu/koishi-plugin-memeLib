import imageTools from "./imageTools";
import gifTools from './gifTools'
import dirTools from './dirTools'
import timeer from './decorator/timmer'
import logger from "./logger";
import bufferTools from "./bufferTools";
import debug from "./debug";

const decorator = { timeer }

// 圆形裁切工具集
const tools = {
    imageTools, gifTools, dirTools,
    decorator, bufferTools,
    debug
}

export default tools