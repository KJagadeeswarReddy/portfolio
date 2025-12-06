// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDocuments, getSettings } from '@/lib/store';
import genAI from '@/lib/gemini-client';
import { Content, FileDataPart } from '@google/genai';

// Function to convert the async generator to a ReadableStream
function iteratorToStream(iterator: AsyncGenerator<any>) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        // Assuming value is a chunk of data, like a string or Uint8Array
        // The SDK likely returns objects with a `text` property or similar
        const chunk = value?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        controller.enqueue(new TextEncoder().encode(chunk));
      }
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user') {
      return NextResponse.json({ error: 'Last message must be from user' }, { status: 400 });
    }

    const settings = await getSettings();
    const documents = await getDocuments();

    // Filter for documents that have been synced
    const syncedDocuments = documents.filter(doc => doc.googleFileUri);
    const fileDataParts: FileDataPart[] = syncedDocuments.map(doc => ({
        fileData: {
            mimeType: doc.mimeType,
            fileUri: doc.googleFileUri!,
        }
    }));


    const model = genAI.getGenerativeModel({
        model: settings.modelName,
        systemInstruction: settings.systemInstruction,
    });

    // Construct the full prompt including chat history and file context
    const contents: Content[] = [
        ...messages.map((msg: { role: string; content: string; }) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        })),
    ];

    // Add file data to the last user message
    if (fileDataParts.length > 0) {
        const lastUserContent = contents[contents.length - 1];
        if(lastUserContent.role === 'user') {
            lastUserContent.parts.push(...fileDataParts);
        }
    }


    const stream = await model.generateContentStream({ contents });
    const readableStream = iteratorToStream(stream);

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
