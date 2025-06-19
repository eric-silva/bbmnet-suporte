'use server';

import { NextFunction, Request, Response } from 'express';
import UtilsService from './service';

const utilsService = new UtilsService();

  export async function uploadFile(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Response | any> {
    try {
      const { base64, filePath } = request.body;
      await utilsService.uploadFileFromBase64(base64, filePath);
      return response.sendStatus(200);
    } catch (e) {
      next(e);
    }
  }

  export async function deleteFiles(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Response | any> {
    try {
      const { filePathes } = request.body;
      await utilsService.deleteMultipleFiles(filePathes);
      return response.sendStatus(200);
    } catch (e) {
      next(e);
    }
  }

  export async function getDocs(request: Request, response: Response, next: NextFunction) {
    try {
      const { list, fileName, docHabilitacao } = request.body;
      const file = await utilsService.getDocs(
        list,
        fileName
      );

      return response.send(file);
    } catch (e) {
      return next(e);
    }
  }  

