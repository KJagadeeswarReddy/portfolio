// lib/gemini-file-manager.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getDocuments, getDocumentPath, updateDocumentMeta } from "./store";
import genAI from "./gemini-client";
export async function syncDocumentsToGoogle() {
  const documents = await getDocuments();

  for (const doc of documents) {
    if (doc.googleFileUri) {
      console.log(`Skipping ${doc.name}, already synced.`);
      continue;
    }

    const filePath = getDocumentPath(doc.filename);
    const mimeType = doc.mimeType;

    try {
      console.log(`Uploading ${doc.name} to Google...`);
      const response = await genAI.files.upload({
        file: {
          path: filePath,
          displayName: doc.name,
        },
        mimeType,
      });

      const uri = response.file.uri;
      await updateDocumentMeta(doc.id, { googleFileUri: uri });
      console.log(`Synced ${doc.name} to Google: ${uri}`);
    } catch (error) {
      console.error(`Failed to sync ${doc.name}:`, error);
    }
  }
}
