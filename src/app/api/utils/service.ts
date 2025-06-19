import CloudStorageHelper from "@/helpers/cloudstorage";
import { FileDoc } from "./entities/Dtos";
import JSZip from "jszip";
import UtilsUtil from "./utils";

class UtilsService {

  private cloudStorageHelper: CloudStorageHelper
  private util: UtilsUtil;

  constructor(
  ) {
    this.cloudStorageHelper = new CloudStorageHelper("your-bucket-name");
    this.util = new UtilsUtil(this.cloudStorageHelper);
  }

  async getDocs(list: FileDoc[], fileName: string) {
    const zip = new JSZip();

    await Promise.all(
      list.map(async (documento) => {
        try {
          const doc = await this.util.getDocs(documento.file);
          const file = doc[0];
          zip.file(String(documento.name).replace(/\//g, '-'), file);
        } catch (error) {}
      })
    );

    const file = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    const filePath = `cacheDocs/${Date.now()}/${fileName}.zip`;

    await this.cloudStorageHelper.uploadFileFromMemory(file, filePath);

    return {
      file: `${fileName}.zip`,
      filePath,
    };
  }
  
  async uploadFileFromBase64(base64: string, filePath: string) {
    
    try {
      const upload = await this.cloudStorageHelper.uploadFileFromBase64(
        base64,
        filePath
      );
      return upload;
    } catch (error) {
      throw new Error(
        ', erro no upload, tente novamente'
      );
    }
  }

  async generateFileSignedURLFromPath(filePath?: string) {
    validadeURL(filePath);
    if (!filePath) {
      throw new Error(', caminho do arquivo invalido');
    }
    return this.cloudStorageHelper.generateFileSignedURLFromPath(filePath);
  }

  async deleteFile(filePath: string) {
    return this.cloudStorageHelper.deleteFileFromBucket(filePath);
  }

  async deleteMultipleFiles(filePathes: string[] = []) {
    return filePathes.map((filePath) =>
      this.cloudStorageHelper.deleteFileFromBucket(filePath)
    );
  }  

  async getUploadLinks(filesPath: { id: string; path: string }[]) {
    const bucket = this.cloudStorageHelper.getBucket();

    try {
      const linksPromises = filesPath.map(async (filePath) => {
        const file = bucket.file(filePath.path);
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutos

        const [url] = await file.getSignedUrl({
          version: 'v4',
          action: 'write',
          expires: expiresAt,
        });

        return { url, id: filePath.id };
      });
      const links = await Promise.all(linksPromises);
      return links.sort((a, b) => a.id.localeCompare(b.id));
    } catch (error) {
      console.error('Erro ao gerar signed URL:', error);
      throw error;
    }
  }
}

function validadeURL(filePath: string | undefined) {
  throw new Error("Function not implemented.");
}

export default UtilsService;