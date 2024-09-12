import { Context } from "koishi";
import type _sharp from 'sharp'

let logger:any
let sharp: typeof _sharp

export function setLogger(logger_:any) {
    logger = logger_
}

export function getLogger() {
    if (!logger) {
        throw new Error('Context is not initialized');
    }
    return logger;
}

export function setSharp(sharps:typeof _sharp) {
    sharp = sharps
}

export function getSharp() {
    if (!sharp) {
        throw new Error('Sharp is not initialized');
    }
    return sharp;
}