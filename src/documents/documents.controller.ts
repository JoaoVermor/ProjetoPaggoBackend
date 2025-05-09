import { Controller, Post, UploadedFile, UseInterceptors, UseGuards, Req, Get, Body, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DocumentsService } from './documents.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/gif'
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Tipo de arquivo não suportado. Apenas imagens são permitidas.'), false);
        }
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req) {
    const userId = req.user.userId;
    const fileUrl = `/uploads/${file.filename}`;
    const document = await this.documentsService.createDocument({
      fileName: file.filename,
      fileType: file.mimetype,
      fileUrl,
      userId,
    });
    // Processar OCR
    const extractedText = await this.documentsService.extractTextFromFile(document.id, file.filename);
    return {
      message: 'Arquivo enviado, salvo no banco de dados e texto extraído com sucesso!',
      document: { ...document, extractedText },
    };
  }

  @Get('history')
  @UseGuards(AuthGuard('jwt'))
  async getUserDocuments(@Req() req) {
    const userId = req.user.userId;
    return this.documentsService.findDocumentsByUser(userId);
  }

  @Post(':id/ask')
  @UseGuards(AuthGuard('jwt'))
  async askLlm(@Req() req, @Body() body, @Param('id') id: string) {
    const userId = req.user.userId;
    const question = body.question;
    const interaction = await this.documentsService.askLlm(id, question);
    return interaction;
  }
}
