import { HttpException, Injectable, Logger } from '@nestjs/common';
import { WeatherResponseData } from './weather.response.data';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  private readonly requestConfig = {
    headers: {
      'X-Api-Key': process.env.WEATHER_API_KEY,
      'Content-Type': 'application/json',
    },
  };

  private uri = 'https://api.api-ninjas.com/v1/weather';

  constructor(private readonly httpService: HttpService) {}

  async getCity(city: string): Promise<WeatherResponseData> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<WeatherResponseData>(
          `${this.uri}?city=${city}`,
          this.requestConfig,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(
              `Error to get city ${city}, status: ${error.response?.status}, message: ${error.message}`,
              error.stack,
            );
            throw new HttpException(
              'Erro ao consultar cidade',
              error.response?.status || 500,
            );
          }),
        ),
    );
    return data;
  }

  async getCities(cities: string[]): Promise<Array<WeatherResponseData>> {
    try {
      const result = await Promise.allSettled(
        cities.map((city: string) =>
          firstValueFrom(
            this.httpService
              .get<WeatherResponseData>(
                `${this.uri}?city=${city}`,
                this.requestConfig,
              )
              .pipe(
                catchError((error: AxiosError) => {
                  this.logger.error(
                    `Error to get city ${city}, status: ${error.response?.status}, message: ${error.message}`,
                    error.stack,
                  );
                  throw new HttpException(
                    'Erro ao consultar cidade',
                    error.response?.status || 500,
                  );
                }),
              ),
          ),
        ),
      );

      return result
        .filter((response) => response.status === 'fulfilled')
        .map((response: any) => response.value.data);
    } catch (err) {
      this.logger.error('Error fetching cities', err);
      throw new HttpException('Erro ao consultar cidades', 500);
    }
  }

  async getAverage(city: any): Promise<string> {
    const response = await this.getCity(city);
    return `${(response.max_temp + response.min_temp) / 2}`;
  }
}
