

import Data from "../Data";


function debug(...args: any[]) {
    const baseData = Data.baseData
    const logger = baseData.logger
    const config = baseData.config

    // 如果未开启调试模式，直接返回
    if (!config.debug) return;

    // 格式化输出的日志信息
    const formattedArgs = args.map(arg => {
        if (typeof arg === 'object') {
            // 如果是对象，格式化为 JSON 字符串
            try {
                return JSON.stringify(arg, null, ' ');
            } catch (e) {
                return '[无法序列化对象]'
            }
        }
        return String(arg);  // 非对象转为字符串
    });

    // 打印日志
    logger.info('DEBUG =||', formattedArgs.join('\n'));
}

export default debug