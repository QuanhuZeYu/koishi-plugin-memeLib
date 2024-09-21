import { Awaitable, Context, Schema, Service } from 'koishi'
import Data from './Data/index'
import type { } from '@quanhuzeyu/koishi-plugin-qhzy-sharp'
import type { } from "@quanhuzeyu/koishi-plugin-canvas"

import MemeGenerator from './memeGenerator'

export const name = 'memelib'
export const filter = false
export const usage = "\
# memelib: meme generator\n\
默认使用sharp作为图片处理库，请先安装qhzy-sharp服务\n\
该库主要作用是为memes提供实现\n\
\n\
## 提供的主要功能\n\
`~tools.giftools.compose`提供了强大的图片合成功能，第一个参数是背景图<Buffer>，第二个参数是需要参与合成图片\
它是一个数组类型，在TS中类型声明为ComposeJoin[]\n\n\
ComposeJoin类型为`{img:Buffer,frameData:FrameData}`\n\n\
FrameData类型为`{x?: number,y?: number,width?: number,height?: number,rotate?: number,blendOption?:createFrameOption}`\n\n\
该库还有其他工具函数为合成meme图像提供帮助，如多张GIF对齐功能返回对齐后的Buffer帧序列\
"

export const inject = {
	required: ['QhzySharp', 'canvas']
}

export interface Config {
	debug?: boolean
}

export const Config: Schema<Config> = Schema.object({
	debug: Schema.boolean().default(false).description('是否开启debug模式，如果开启日志中会显示图片合成时间等信息')
})

export function apply(ctx: Context) {
	const { baseData } = Data
	baseData.config = ctx.config
	baseData.logger = ctx.logger
	baseData.sharp = ctx.QhzySharp.Sharp
	baseData.canvas = ctx.canvas
	if (baseData.canvas) { Data.tools.debug('canvas loaded') } else { Data.tools.debug('canvas not loaded') }
	ctx.plugin(MemeLib)
}

declare module 'koishi' {
	interface Context {
		memelib: MemeLib
	}
}

export class MemeLib extends Service {
	memelib: typeof MemeGenerator

	constructor(ctx: Context, config: Config) {
		super(ctx, 'memelib')
		this.config = {
			...config
		}

	}

	protected async start() {
		this.memelib = MemeGenerator
		const logger = Data.baseData.logger
		logger.info('memelib loaded')
	}
}
