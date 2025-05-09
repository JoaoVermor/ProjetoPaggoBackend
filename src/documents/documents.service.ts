import { Injectable } from '@nestjs/common';
import { PrismaClient, DocumentStatus } from '@prisma/client';
import * as Tesseract from 'tesseract.js';
import { join } from 'path';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
dotenv.config();

@Injectable()
export class DocumentsService {
  private prisma = new PrismaClient();

  async createDocument(data: {
    fileName: string;
    fileType: string;
    fileUrl: string;
    userId: string;
  }) {
    return this.prisma.document.create({
      data: {
        fileName: data.fileName,
        fileType: data.fileType,
        fileUrl: data.fileUrl,
        userId: data.userId,
        status: DocumentStatus.PENDING,
      },
    });
  }

  async findDocumentsByUser(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async extractTextFromFile(documentId: string, fileName: string) {
    const filePath = join(process.cwd(), 'uploads', fileName);
    const { data } = await Tesseract.recognize(filePath, 'por');
    await this.prisma.document.update({
      where: { id: documentId },
      data: {
        extractedText: data.text,
        status: 'COMPLETED',
      },
    });
    return data.text;
  }

  async askLlm(documentId: string, question: string) {
    const document = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!document || !document.extractedText) {
      throw new Error('Documento não encontrado ou sem texto extraído');
    }
    const prompt = `Texto extraído do documento:\n${document.extractedText}\n\nPergunta: ${question}`;
    const HF_API_TOKEN = process.env.HF_API_TOKEN;
    const HF_MODEL_ID = process.env.HF_MODEL_ID || 'google/flan-t5-base';
    const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt }),
    });
    const result = await response.json();
    let llmResponse = '';
    if (Array.isArray(result)) {
      llmResponse = result[0]?.generated_text || '';
    } else if (result.generated_text) {
      llmResponse = result.generated_text;
    } else if (result[0]?.answer) {
      llmResponse = result[0].answer;
    } else {
      llmResponse = JSON.stringify(result);
    }
    // Salvar interação no banco
    const interaction = await this.prisma.llmInteraction.create({
      data: {
        query: question,
        response: llmResponse,
        documentId,
      },
    });
    return interaction;
  }
}
