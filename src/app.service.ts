import { Injectable } from '@nestjs/common';
import * as Hummus from 'muhammara';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';

const CONFIDENTIAL = 'CONFIDENTIAL';
const ALL_RIGHT_RESERVED = 'All Rights Reserved';

@Injectable()
export class AppService {
  async addWatermarkToPdf(
    inputPathFile: string,
    outputPathFile: string,
  ): Promise<void> {
    return new Promise(async (resolve) => {
      let recipe: Hummus.Recipe;

      try {
        recipe = new Hummus.Recipe(inputPathFile, outputPathFile);
      } catch (error) {
        if (error.message === 'TypeError: Unable to start parsing PDF file') {
          recipe = await this.convertToHummusFormat(
            inputPathFile,
            outputPathFile,
          );
        } else {
          console.error('Error in Hummus Recipe:', error);
          return;
        }
      }

      const reader = Hummus.createReader(inputPathFile);
      const pages = reader.getPagesCount();

      for (let i = 1; i <= pages; i++) {
        const { width, height } = Object(recipe.pageInfo(i));
        const angle = 360 - (Math.atan(height / width) * 180) / Math.PI;
        const options = {
          bold: true,
          size: 60,
          color: '#000000',
          align: 'center center',
          opacity: 0.06,
          rotation: angle,
        };

        recipe
          .editPage(i)
          .text(CONFIDENTIAL, width / 2 - 25, height / 2 - 25, options)
          .text(ALL_RIGHT_RESERVED, width / 2 + 25, height / 2 + 25, options)
          .endPage();
      }
      recipe.endPDF(() => {
        resolve();
      });
    });
  }

  async convertToHummusFormat(
    inputPathFile: string,
    outputPathFile: string,
  ): Promise<Hummus.Recipe> {
    const fileBytes = fs.readFileSync(inputPathFile);
    const convertedPdf = await PDFDocument.load(fileBytes);
    const pdfBytes = await convertedPdf.save();

    fs.writeFileSync(inputPathFile, pdfBytes);

    return new Hummus.Recipe(inputPathFile, outputPathFile);
  }
}
