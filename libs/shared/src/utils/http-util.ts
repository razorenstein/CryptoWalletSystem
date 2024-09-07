import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpException } from '@nestjs/common';

export class HttpUtil {
  static async get<T>(
    httpService: HttpService,
    url: string,
    params?: Record<string, any>,
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await firstValueFrom(
        httpService.get<T>(url, { params }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        {
          message: 'HTTP request failed',
          details: { url, params, originalError: error.message },
        },
        500,
      );
    }
  }
}
