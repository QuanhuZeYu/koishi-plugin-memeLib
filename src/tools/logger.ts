import { getCurTime } from "./_time";
import fs from 'fs'
import path from "path";
import * as yaml from 'js-yaml'
import { MY_PLUGIN_DIR } from "..";


interface Config {
    level: LogLevel|string;
  }
// 读取配置文件并设置日志级别
export function readConfig() {
    const configPath = path.join(MY_PLUGIN_DIR, '../tmp/config.yml');

    if (!fs.existsSync(configPath)) {
        console.log('配置文件不存在，设置日志为 close');
        Logger.closeLog();
        return;
    }

    try {
        const fileContents = fs.readFileSync(configPath, 'utf8');
        const config = yaml.load(fileContents) as { level: LogLevel | string };

        // 确保 level 是有效的 LogLevel
        const logLevel: LogLevel = (typeof config.level === 'string' && ['debug', 'info', 'warn', 'error', 'log', 'close'].includes(config.level))
            ? config.level as LogLevel
            : 'log';

        Logger.setLevel(logLevel);
        console.log(`日志级别设置为: ${logLevel}`);
    } catch (e) {
        console.error('读取或解析配置文件失败:', e);
        Logger.closeLog();
    }
}


type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'log';

class Logger {
    private static currentLevel: LogLevel = 'debug'; // 默认日志级别为 'debug'
    private static isClosed: boolean = false; // 单独的标记，指示日志是否被关闭
    private static levels: Record<LogLevel, number> = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
        log: 4
    };

    // 设置当前日志级别
    static setLevel(level: LogLevel) {
        if (!this.isClosed && this.levels[level] !== undefined) {
            this.currentLevel = level;
        }
    }

    // 获取当前时间的字符串
    private static getFormattedTime(): string {
        return new Date().toISOString(); // 示例，返回当前时间的 ISO 字符串
    }

    // 获取调用者的文件名和行号
    private static getCallerInfo(): string {
        const err = new Error();
        const stack = err.stack?.split('\n') || [];
        const callerLine = stack[3] || ""; // 获取堆栈信息中的第4行（即调用者的信息）
        const match = callerLine.match(/\((.*):(\d+):(\d+)\)/); // 正则匹配文件路径、行号和列号

        if (match) {
            const filePath = match[1];
            const lineNumber = match[2];
            return `${filePath}:${lineNumber}`;
        }
        return 'unknown';
    }

    // 通用的日志输出方法
    private static print(level: LogLevel, ...args: any[]): void {
        if (!this.isClosed && this.levels[level] >= this.levels[this.currentLevel]) {
            const time = this.getFormattedTime();
            const prefix = `[memelib | ${time}] [${level.toUpperCase()}]`; // 日志前缀
            console[level](prefix, ...args);
        }
    }

    // 关闭所有日志输出
    static closeLog(): void {
        this.isClosed = true;
    }

    // 各种日志级别的方法
    static debug(...args: any[]): void {
        this.print('debug', ...args);
    }

    static info(...args: any[]): void {
        this.print('info', ...args);
    }

    static warn(...args: any[]): void {
        this.print('warn', ...args);
    }

    static error(...args: any[]): void {
        this.print('error', ...args);
    }

    static log(...args: any[]): void {
        this.print('log', ...args);
    }
}


export default Logger;