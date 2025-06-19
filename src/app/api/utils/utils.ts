import CloudStorageHelper from "@/helpers/cloudstorage";
import axios from "axios";

class UtilsUtil {
    
  constructor(
    private storageHelper: CloudStorageHelper
  ) {}


  getDocs(path: string) {
    return this.storageHelper.download(path);
  }

  async download(link: string) {
    try {
        const resp = await axios.get(link, { responseType: 'arraybuffer' });
        return resp.data;
    } catch (error) {
        return {};
    }
  }

  async downloadDoc(path: string) {
    const buckets = [
      process.env.BUCKET_NAME,
      process.env.BUCKET_DOC_HABILITACAO,
    ];

    let cont = true;
    let bucketFile = undefined;

    do {
      const bucket = buckets.shift();
      if (!bucket) {
        cont = false;
        break;
      }
      const existsFile = await this.storageHelper.checkFromBucket(path, bucket);
      if (existsFile[0]) {
        bucketFile = bucket;
        break;
      }

      if (buckets.length == 0) {
        cont = false;
      }
    } while (cont);

    if (!bucketFile) {
      throw new Error('Arquivo não encontrado');
    }

    const file = await this.storageHelper.downloadFromBucket(path, bucketFile);
    const arq = file;
    return arq;
  }  

}


export default UtilsUtil;