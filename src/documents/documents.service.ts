import { Injectable } from '@nestjs/common';
import { PrismaClient, DocumentStatus } from '@prisma/client';
import * as Tesseract from 'tesseract.js';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';
import OpenAI from 'openai';
const execAsync = promisify(exec);
dotenv.config();

@Injectable()
export class DocumentsService {
  private prisma = new PrismaClient();
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não configurada no .env');
    }
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async createDocumentWithOcr(file: Express.Multer.File, userId: string) {
    // 1. Converta o arquivo para base64 com o prefixo correto
    const fileBase64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    // 2. Extraia o texto usando Tesseract
    const { data } = await Tesseract.recognize(file.buffer, 'por');
    const extractedText = data.text;

    // 3. Salve tudo no MongoDB
    const document = await this.prisma.document.create({
      data: {
        fileName: file.originalname,
        fileType: file.mimetype,
        fileBase64,
        userId,
        fileUrl: '', // Adicionando campo obrigatório
        fileId: '', // Adicionando campo obrigatório
        extractedText,
        status: 'COMPLETED',
      },
    });

    return document;
  }

  async findDocumentsByUser(userId: string) {
    const documents = await this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fileName: true,
        createdAt: true,
        status: true,
        extractedText: true,
        fileBase64: true,
      },
    });

    return documents.map(doc => ({
      ...doc,
      imageBase64: doc.fileBase64, // Renomeando para manter compatibilidade com o frontend
    }));
  }

  async findById(id: string) {
    return this.prisma.document.findUnique({
      where: { id },
    });
  }

  async extractTextFromFile(documentId: string, fileName: string) {
    const filePath = join(process.cwd(), 'uploads', fileName);
    let extractedText = '';

    if (fileName.toLowerCase().endsWith('.pdf')) {
      // Converter PDF para imagens
      const outputDir = join(process.cwd(), 'uploads', 'temp');
      await execAsync(`pdftoppm -png "${filePath}" "${outputDir}/page"`);
      
      // Processar cada página do PDF
      const fs = require('fs');
      const files = fs.readdirSync(outputDir).filter(file => file.startsWith('page-') && file.endsWith('.png'));
      
      for (const file of files) {
        const imagePath = join(outputDir, file);
        const { data } = await Tesseract.recognize(imagePath, 'por');
        extractedText += data.text + '\n';
        
        // Limpar arquivo temporário
        fs.unlinkSync(imagePath);
      }
      
      // Remover diretório temporário
      fs.rmdirSync(outputDir);
    } else {
      // Processamento normal para imagens
      const { data } = await Tesseract.recognize(filePath, 'por');
      extractedText = data.text;
    }

    await this.prisma.document.update({
      where: { id: documentId },
      data: {
        extractedText,
        status: 'COMPLETED',
      },
    });

    return extractedText;
  }

  async askLlm(documentId: string, question: string) {
    const document = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!document || !document.extractedText) {
      throw new Error('Documento não encontrado ou sem texto extraído');
    }

    const prompt = `Você é um assistente especializado em analisar documentos. 
    Abaixo está o texto extraído de um documento. Por favor, responda à pergunta com base neste texto.
    
    Texto do documento:
    ${document.extractedText}
    
    Pergunta: ${question}
    
    Por favor, forneça uma resposta clara e concisa.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Você é um assistente especializado em analisar documentos e responder perguntas sobre seu conteúdo."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.95,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      });

      const llmResponse = completion.choices[0].message.content;

      // Salvar interação no banco
      const interaction = await this.prisma.llmInteraction.create({
        data: {
          query: question,
          response: llmResponse ?? '', // Garantindo que response nunca será null
          documentId,
        },
      });

      return interaction;
    } catch (error) {
      console.error('Erro ao processar a requisição do LLM:', error);
      throw new Error(`Erro ao processar a pergunta: ${error.message}`);
    }
  }
}
