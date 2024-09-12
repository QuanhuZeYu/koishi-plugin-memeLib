import { getLogger } from "../../Data/context";
import logger from "../logger";


// 定义一个泛型类型用于处理异步函数
type AsyncFunction<T extends (...args: any[]) => any> = ReturnType<T> extends Promise<any> ? T : T;

// 创建一个可传参的 timeIt 函数                                    ↓↓↓↓↓↓此处更改计时器开关↓↓↓↓↓↓
function timeIt<T extends (...args: any[]) => any>(func: T, debug: boolean = true): AsyncFunction<T> {
    return function (...args: Parameters<T>): ReturnType<T> {
        if (!debug) {
            // 如果 debug 关闭，直接调用函数并返回结果
            return func(...args) as ReturnType<T>;
        }

        const start = performance.now(); // 记录开始时间
        const result = func(...args); // 调用函数

        if (result instanceof Promise) {
            // 处理异步函数
            return result
                .then((res) => {
                    const end = performance.now(); // 记录结束时间
                    logger.info(`${func.name} 执行时间: ${(end - start).toFixed(2)} 毫秒`);
                    return res;
                })
                .catch((err) => {
                    const end = performance.now(); // 记录结束时间
                    logger.info(`${func.name} 执行时间: ${(end - start).toFixed(2)} 毫秒`);
                    return Promise.reject(err);
                }) as ReturnType<T>; // 强制类型转换为返回类型
        } else {
            // 处理同步函数
            const end = performance.now(); // 记录结束时间
            logger.info(`${func.name} 执行时间: ${(end - start).toFixed(2)} 毫秒`);
            return result as ReturnType<T>; // 强制类型转换为返回类型
        }
    } as AsyncFunction<T>; // 强制类型转换为原函数类型
}

export default timeIt