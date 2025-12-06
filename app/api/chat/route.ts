import { NextRequest, NextResponse } from 'next/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { BytesOutputParser } from '@langchain/core/output_parsers';
import { getDocuments, getDocumentPath } from '@/lib/store';
import fs from 'fs/promises';

async function loadContextFromDocuments(): Promise<string> {
  const docMetas = await getDocuments();
  let context = '';
  for (const meta of docMetas) {
    try {
      const filePath = getDocumentPath(meta.filename);
      const content = await fs.readFile(filePath, 'utf-8');
      context += `--- Document: ${meta.name} ---\n${content}\n\n`;
    } catch (error) {
      console.error(`Failed to load document: ${meta.filename}`, error);
    }
  }
  return context;
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

    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-flash-lite',
      maxOutputTokens: 2048,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
      ],
    });

    const context = await loadContextFromDocuments();
    const systemPrompt = `You are a helpful assistant. Answer the user's questions based on the following context:\n\n${context}`;

    const chatHistory = messages.slice(0, -1).map((msg: any) =>
        msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
    );

    const fullPrompt = [
        new HumanMessage(systemPrompt),
        ...chatHistory,
        new HumanMessage(lastMessage.content)
    ];

    const outputParser = new BytesOutputParser();
    const stream = await model.pipe(outputParser).stream(fullPrompt);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
