export interface FrameData {
    x?: number
    y?: number
    width?: number
    height?: number
    rotate?: number
    blendOption?:createFrameOption
    opacity?: number
}

export interface ComposeJoin{
    img:Buffer,
    frameData:FrameData
}

export type createFrameOption =
        | "clear"
        | "source"
        | "over"
        | "in"
        | "out"
        | "atop"
        | "dest"
        | "dest-over"
        | "dest-in"
        | "dest-out"
        | "dest-atop"
        | "xor"
        | "add"
        | "saturate"
        | "multiply"
        | "screen"
        | "overlay"
        | "darken"
        | "lighten"
        | "color-dodge"
        | "colour-dodge"
        | "color-burn"
        | "colour-burn"
        | "hard-light"
        | "soft-light"
        | "difference"
        | "exclusion";

export interface GifQuality {
    color:number,
    bayer_scale:number
}
export interface GifQualityList {
    heigh:GifQuality,
    medium:GifQuality,
    low:GifQuality
    veryLow:GifQuality
}


