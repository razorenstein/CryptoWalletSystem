import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { WalletSystemLogger } from '@shared/logging';

@Injectable()
export class FileManagementService {
  private readonly baseDir = path.join(__dirname, '../../../data');

  constructor(private readonly logger: WalletSystemLogger) {}

  private ensureDirectoryExists(directory: string) {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });  // Create the directory if it doesn't exist
    }
  }

  async saveToFile<T>(fileName: string, data: T): Promise<void> {
    const filePath = path.join(this.baseDir, `${fileName}.json`);
    this.ensureDirectoryExists(this.baseDir);  // Ensure the base directory exists before saving

    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), {
        encoding: 'utf8',
      });
      this.logger.log(`Saved data to file`, FileManagementService.name, { fileName });
    } catch (error) {
      this.logger.error(`Failed to save data to file`, error.stack, FileManagementService.name, { fileName });
      throw new InternalServerErrorException(`Failed to save data: ${fileName}`);
    }
  }

  async readFromFile<T>(fileName: string): Promise<T | null> {
    const filePath = path.join(this.baseDir, `${fileName}.json`);
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, { encoding: 'utf8' });
        this.logger.log(`Read data from file`, FileManagementService.name, { fileName });
        return JSON.parse(data) as T;
      } else {
        this.logger.warn(`File not found`, FileManagementService.name, { fileName });
        return null;
      }
    } catch (error) {
      this.logger.error(`Failed to read data from file`, error.stack, FileManagementService.name, { fileName });
      throw new InternalServerErrorException(`Failed to read data: ${fileName}`);
    }
  }
}
