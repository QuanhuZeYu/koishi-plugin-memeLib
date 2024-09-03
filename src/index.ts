import { Context, Schema } from 'koishi'

import type { SharpService } from "@quanhuzeyu/koishi-plugin-qhzy-sharp"

export const name = 'memelib'
export const inject = {
	required: ['QhzySharp']
}
export let pluginSharp:SharpService

export interface Config {
	hello: string
}

export const Config: Schema<Config> = Schema.object({
	hello: Schema.string().default('hello world'),
})

export function apply(ctx: Context) {
	pluginSharp = ctx.QhzySharp
}
