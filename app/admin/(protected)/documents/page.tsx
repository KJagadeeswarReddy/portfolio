// app/admin/(protected)/documents/page.tsx
import { getDocuments, saveDocumentMeta } from "@/lib/store";
import { syncDocumentsToGoogle } from "@/lib/gemini-file-manager";
import { revalidatePath } from "next/cache";
import { CheckCircle } from 'lucide-react';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data/documents');

async function getFileMimeType(buffer: Buffer): Promise<string> {
  const { fileTypeFromBuffer } = await (eval('import("file-type")') as Promise<
    typeof import("file-type")
  >);
  const result = await fileTypeFromBuffer(buffer);
  return result?.mime || "application/octet-stream";
}

async function handleFileUpload(formData: FormData) {
  'use server';

  const file = formData.get('file') as File;
  if (!file) {
    return;
  }

  const newId = Date.now().toString();
  const newFilename = `${newId}-${file.name}`;
  const filePath = path.join(DATA_DIR, newFilename);
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = await getFileMimeType(buffer);

  // Save the file
  fs.writeFileSync(filePath, buffer);

  // Save metadata
  await saveDocumentMeta({
    id: newId,
    name: file.name,
    filename: newFilename,
    createdAt: new Date().toISOString(),
    mimeType: mimeType,
  });

  revalidatePath('/admin/documents');
}

export default async function DocumentsPage() {
  const documents = await getDocuments();

  async function syncAndRevalidate() {
    'use server';
    await syncDocumentsToGoogle();
    revalidatePath('/admin/documents');
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Knowledge Base</h1>
        <form action={syncAndRevalidate}>
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Sync to Google
          </button>
        </form>
      </div>

      {/* File Upload Form */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Upload New Document</h2>
        <form action={handleFileUpload} className="bg-white p-4 shadow-md rounded">
          <input type="file" name="file" required className="mb-2" />
          <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Upload
          </button>
        </form>
      </div>

      <div className="bg-white shadow-md rounded">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Created At</th>
              <th className="px-4 py-2">Synced</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b">
                <td className="px-4 py-2">{doc.name}</td>
                <td className="px-4 py-2">{new Date(doc.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  {doc.googleFileUri && <CheckCircle className="h-5 w-5 text-green-500" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
