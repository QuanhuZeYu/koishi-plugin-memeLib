import type sharp_T from "sharp"
import type CanvasService from "koishi-plugin-puppeteer/src/canvas"
import type * as cjl from '@cordisjs/logger'
import path from "path"
import { MY_PLUGIN_DIR } from "../interface/BASE_DATA"
import { Config } from ".."


let sharp: typeof sharp_T
let canvas: any
let logger: cjl.LoggerService
let config: Config
/** "~/lib/memeGenerator" */
let memeGenDir = process.env.NODE_ENV === 'development' ? path.resolve(MY_PLUGIN_DIR, 'memeGenerator') : path.resolve(MY_PLUGIN_DIR, 'lib', 'memeGenerator')  // ~/lib/memeGenerator


const baseData = {
    logger,
    config,
    /** "~/lib/memeGenerator" */
    memeGenDir,
    sharp,
    canvas,
}

export default baseData