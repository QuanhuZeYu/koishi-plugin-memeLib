import { getCurTime } from "./_time";

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'log';

class Logger {
    private static currentLevel: LogLevel = 'debug'; // 默认日志级别为 'debug'
    private static levels: Record<LogLevel, number> = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
        log: 4,
    };

    // 设置当前日志级别
    static setLevel(level: LogLevel) {
        this.currentLevel = level;
    }

    // 获取当前时间的字符串
    private static getFormattedTime(): string {
        return getCurTime();
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
        if (this.levels[level] >= this.levels[this.currentLevel]) {
            const time = this.getFormattedTime();
            const prefix = `[memelib | ${time}] [${level.toUpperCase()}]`; // 日志前缀
            console[level](prefix, ...args);
        }
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