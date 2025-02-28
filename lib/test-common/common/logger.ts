import util from 'util';
import chalk from 'chalk';

export type LogLevel = 'verbose' | 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
}

const levelColors: Record<LogLevel, chalk.Chalk> = {
    error: chalk.red,
    warn: chalk.yellow,
    info: chalk.white,
    debug: chalk.magenta,
    verbose: chalk.magentaBright,
};

function getTime(): string {
    return new Date().toISOString().replace('T', ' ').split('.')[0];
}

export class TestLogger {
    constructor(private namespace: string, private logLevel: LogLevel = 'info') {}

    private log(level: LogLevel, message: string, ...params: any[]) {
        if (this.shouldLog(level)) {
            const entry: LogEntry = {
                level,
                message: util.format(message, ...params),
                timestamp: getTime(),
            };
            this.print(entry);
        }
    }

    private shouldLog(level: LogLevel): boolean {
        const levels = ['verbose', 'debug', 'info', 'warn', 'error'];
        return levels.indexOf(level) >= levels.indexOf(this.logLevel);
    }

    private print({ level, message, timestamp }: LogEntry) {
        const color = levelColors[level];
        const formatted = `${chalk.dim(timestamp)} ${color(level.toUpperCase())} [${chalk.cyan(this.namespace)}] - ${message}`;
        console.log(formatted);
    }

    public error(message: string, ...params: any[]) {
        this.log('error', message, ...params);
    }

    public warn(message: string, ...params: any[]) {
        this.log('warn', message, ...params);
    }

    public info(message: string, ...params: any[]) {
        this.log('info', message, ...params);
    }

    public debug(message: string, ...params: any[]) {
        this.log('debug', message, ...params);
    }

    public verbose(message: string, ...params: any[]) {
        this.log('verbose', message, ...params);
    }
}