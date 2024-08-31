import imageTools from "./imageTools";
import gifTools from './gifTools'
import dirTools from './dirTools'
import timeer from './decorator/timmer'
import logger from "./logger";

const decorator = {timeer}

// 圆形裁切工具集
const tools = {imageTools,gifTools,dirTools,decorator,
    logger
}

export default tools