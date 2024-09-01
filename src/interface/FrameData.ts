export interface FrameData {
    x?: number
    y?: number
    width?: number
    height?: number
    rotate?: number
    blendOption?:createFrameOption
}

export interface ComposeJoin{
    img:Buffer,
    frameData:FrameData
}

export interface createFrameOption {
    blend:
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
}