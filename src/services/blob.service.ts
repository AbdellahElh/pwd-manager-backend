// src/services/blob.service.ts
import { BlobServiceClient } from "@azure/storage-blob";

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING as string;
const CONTAINER_NAME = "face-images";

export async function uploadFaceImage(fileBuffer: Buffer, fileName: string): Promise<string> {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );
  const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
  
  // Create container if it doesn't exist
  await containerClient.createIfNotExists({
    access: "container", // or "private" as per your requirements
  });
  
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  await blockBlobClient.uploadData(fileBuffer);
  
  return blockBlobClient.url;
}
