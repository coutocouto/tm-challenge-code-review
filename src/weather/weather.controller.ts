import {
  Injectable,
  Controller,
  Inject,
  Get,
  Query,
  ParseArrayPipe,
} from '@nestjs/common';
import { WeatherResponseData } from './weather.response.data';
import { WeatherService } from './weather.service';

@Injectable()
@Controller('weather')
export class WeatherController {
  constructor(
    @Inject(WeatherService)
    private readonly service: WeatherService,
  ) {}

  @Get('/city')
  async getCity(@Query('city') city: string): Promise<WeatherResponseData> {
    return await this.service.getCity(city);
  }

  @Get('/cities')
  async getCities(
    @Query('cities', new ParseArrayPipe({ items: String, separator: ',' }))
    cities: string[],
  ): Promise<WeatherResponseData[]> {
    return await this.service.getCities(cities);
  }

  @Get('/average')
  async getAverage(@Query() city: string): Promise<string> {
    return await this.service.getAverage(city);
  }
}
