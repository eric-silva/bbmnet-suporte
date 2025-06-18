import { getStorage } from 'firebase-admin/storage';

class CloudStorageHelper {
  private bucket;
  constructor(private bucketName: string) {
    this.bucket = getStorage().bucket(this.bucketName);
  }

  getBucket() {
    return this.bucket;
  }

  uploadFileFromBase64(base64: string, filePath: string) {
    const buffer = Buffer.from(base64, 'base64');
    const file = this.bucket.file(filePath);
    return file.save(buffer);
  }

  uploadFileFromMemory(buffer: Buffer, filePath: string) {
    return this.bucket.file(filePath).save(buffer);
  }

  uploadBucketFileFromMemory(
    buffer: Buffer,
    filePath: string,
    bucketName: string
  ) {
    const bucket = getStorage().bucket(bucketName);
    return bucket.file(filePath).save(buffer);
  }

  generateFileSignedURLFromPath(filePath: string): Promise<string[]> {
    // TODO adicionar uma variavel de ambiente para o tempo
    return this.bucket.file(filePath).getSignedUrl({
      action: 'read',
      expires: new Date(Date.now() + 15 * 60000),
    });
  }

  download(filePath: string) {
    return this.bucket.file(filePath).download();
  }

  exists(filePath: string) {
    return this.bucket.file(filePath).exists();
  }

  deleteFileFromBucket(filePath: string) {
    const file = this.bucket.file(filePath);
    return file.delete();
  }

  deleteFileFromSpecificBucket(filePath: string, bucketName: string) {
    const bucket = getStorage().bucket(bucketName);
    const file = bucket.file(filePath);
    return file.delete();
  }

  getMetadata(filePath: string) {
    return this.bucket.file(filePath).getMetadata();
  }

  listDocumentsFromPath(path: string) {
    return this.bucket.getFiles({
      prefix: path,
    });
  }

  downloadFromBucket(filePath: string, bucketName: string) {
    const bucket = getStorage().bucket(bucketName);
    return bucket.file(filePath).download();
  }

  checkFromBucket(filePath: string, bucketName: string) {
    const bucket = getStorage().bucket(bucketName);
    return bucket.file(filePath).exists();
  }

  generateFileSignedURLFromPathFromBucket(
    filePath: string,
    bucketName: string
  ): Promise<string[]> {
    const bucket = getStorage().bucket(bucketName);
    return bucket.file(filePath).getSignedUrl({
      action: 'read',
      expires: new Date(Date.now() + 15 * 60000),
    });
  }

  getfiles() {
    return this.bucket.getFiles();
  }
}

export default CloudStorageHelper;