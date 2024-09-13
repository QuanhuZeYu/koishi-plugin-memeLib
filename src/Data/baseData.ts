import type sharp_T from "sharp"
import type * as cjl from '@cordisjs/logger'
import path from "path"
import { MY_PLUGIN_DIR } from "../interface/BASE_DATA"


let sharp:typeof sharp_T
let logger:cjl.LoggerService
let memeGenDir = path.resolve(MY_PLUGIN_DIR, 'lib', 'memeGenerator')

function setSharp(module:typeof sharp_T) {
    sharp = module
}

function getSharp() {
    return sharp
}

function setLogger(logger_in:cjl.LoggerService) {
    logger = logger_in
}

function getLogger() {
    return logger
}

const baseData = {
    memeGenDir,
    setSharp,getSharp,
    setLogger,getLogger
}

export default baseData