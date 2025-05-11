import { Controller, Post, UploadedFile, UseInterceptors, UseGuards, Req, Get, Body, Param, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DocumentsService } from './documents.service';
import { AuthGuard } from '@nestjs/passport';


class AskQuestionDto {
  question: string;
}

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
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
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    const userId = req.user.userId;
    const document = await this.documentsService.createDocumentWithOcr(file, userId);
    
    return {
      message: 'Arquivo enviado, salvo no banco de dados e texto extraído com sucesso!',
      document,
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
  async askLlm(
    @Req() req,
    @Body() body: AskQuestionDto,
    @Param('id') id: string
  ) {
    if (!body.question || typeof body.question !== 'string') {
      throw new BadRequestException('A pergunta é obrigatória e deve ser uma string');
    }

    if (!id) {
      throw new BadRequestException('ID do documento é obrigatório');
    }

    try {
      const interaction = await this.documentsService.askLlm(id, body.question);
      return {
        success: true,
        data: interaction
      };
    } catch (error) {
      throw new BadRequestException(`Erro ao processar a pergunta: ${error.message}`);
    }
  }
}