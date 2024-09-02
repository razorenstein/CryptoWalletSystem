import { Logger, Injectable } from '@nestjs/common';

@Injectable()
export class WalletSystemLogger extends Logger {
  log(message: any, context?: string, data?: object) {
    const formattedMessage = this.formatMessage('LOG', message, data, context);
    super.log(formattedMessage, context);
  }

  error(message: any, trace?: string, context?: string, data?: object) {
    const formattedMessage = this.formatMessage('ERROR', message, data, context);
    super.error(formattedMessage, trace, context);
  }

  warn(message: any, context?: string, data?: object) {
    const formattedMessage = this.formatMessage('WARN', message, data, context);
    super.warn(formattedMessage, context);
  }

  debug(message: any, context?: string, data?: object) {
    const formattedMessage = this.formatMessage('DEBUG', message, data, context);
    super.debug(formattedMessage, context);
  }

  verbose(message: any, context?: string, data?: object) {
    const formattedMessage = this.formatMessage('VERBOSE', message, data, context);
    super.verbose(formattedMessage, context);
  }

  private formatMessage(
    level: string,
    message: any,
    data?: object,
    context?: string
  ): string {
    const timestamp = new Date().toISOString();
    const contextInfo = context ? `[${context}]` : '';
    const dataString = data ? ` ${JSON.stringify(data, null, 2)}` : ''; 
    return `${timestamp} [${level}] ${contextInfo} ${message}${dataString}`;
  }
}
