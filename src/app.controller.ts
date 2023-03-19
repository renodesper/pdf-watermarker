import { Controller, Body, Post, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

export class WatermarkDto {
  inputFile: string;
  outputFile: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  async addWatermarkToPdf(
    @Res() res: Response,
    @Body() watermarkDto: WatermarkDto,
  ): Promise<void> {
    await this.appService.addWatermarkToPdf(
      watermarkDto.inputFile,
      watermarkDto.outputFile,
    );
    res.status(HttpStatus.OK).json('Success');
  }
}
