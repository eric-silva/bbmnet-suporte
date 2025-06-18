import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from 'crypto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sha1Convert(data: string): string {
  return crypto.createHash('sha1').update(data).digest('hex');
}



/**
 * Generates a unique filename by prepending a GUID (UUID) to the original filename.
 * @param originalFilename - The original name of the file.
 * @returns A new filename in the format "guid_originalFilename".
 */
export function generateUniqueFilename(originalFilename: string): string {
  if (!originalFilename) {
    throw new Error("Original filename cannot be empty.");
  }
  const guid = crypto.randomUUID();
  // Replace spaces or special characters in the original filename for safety, though not strictly required by GCS.
  const safeOriginalFilename = originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${guid}_${safeOriginalFilename}`;
}

/**
 * Simulates uploading a file to a bucket.
 * In a real scenario, this function would handle the actual upload process to cloud storage.
 * @param file - The File object to "upload".
 * @returns A promise that resolves to an object indicating success and the unique filename, or an error.
 */
export async function simulateUploadToBucket(
  file: File
): Promise<{ success: boolean; uniqueFilename?: string; error?: string }> {
  if (!file) {
    return { success: false, error: "No file provided for upload." };
  }

  try {
    const uniqueFilename = generateUniqueFilename(file.name);
    console.log(`Simulating upload of '${file.name}' as '${uniqueFilename}'...`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(`Simulated upload complete for '${uniqueFilename}'.`);
    return { success: true, uniqueFilename: uniqueFilename };
  } catch (error: any) {
    console.error("Error during simulated upload:", error);
    return { success: false, error: error.message || "Failed to simulate upload." };
  }
}

/**
 * Simulates downloading a file from a bucket.
 * In a real scenario, this function would fetch the file from cloud storage and trigger a download.
 * @param uniqueFilename - The unique name of the file stored in the bucket.
 */
export async function simulateDownloadFromBucket(uniqueFilename: string): Promise<{ success: boolean; message: string; data?: any }> {
  if (!uniqueFilename) {
    console.error("No filename provided for download simulation.");
    return { success: false, message: "No filename provided for download simulation." };
  }

  console.log(`Simulating download of file: ${uniqueFilename}`);
  // In a real application, you would fetch the file from GCS here
  // and then initiate a download in the browser, e.g., by creating a temporary link.
  // For simulation, we just log a message.

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const simulatedMessage = `Simulated download for '${uniqueFilename}' initiated. In a real app, the file would start downloading.`;
  console.log(simulatedMessage);
  // You could return mock file data or a success message
  return { success: true, message: simulatedMessage };
}
