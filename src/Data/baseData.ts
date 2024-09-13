import type sharp_T from "sharp"
import type * as cjl from '@cordisjs/logger'


let sharp:typeof sharp_T
let logger:cjl.LoggerService

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
    setSharp,getSharp,
    setLogger,getLogger
}

export default baseData