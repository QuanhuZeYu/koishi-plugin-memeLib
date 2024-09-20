import type { Color, FitEnum } from "sharp"

export interface FrameData {
    x?: number
    y?: number
    width?: number
    height?: number
    rotate?: number
    blendOption?: createFrameOption
    opacity?: number
    resizeBackground?: Color
    resizeFit?: keyof FitEnum
    canvas?: {
        /**透视旋转参数 */
        p_rotate?: {
            /**沿着X轴透视旋转，角度单位度 */
            x?: number
            /**沿着Y轴透视旋转，角度单位度 */
            y?: number
            /**透视旋转完成后再次平面旋转 */
            rotate?: number
        }
    }
}

export interface ComposeJoin {
    img: Buffer,
    frameData: FrameData
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
    color: number,
    bayer_scale: number
}
export interface GifQualityList {
    heigh: GifQuality,
    medium: GifQuality,
    low: GifQuality
    veryLow: GifQuality
}


