# Backend Paggo - Sistema de Análise de Documentos com OCR e LLM

Este projeto é um backend desenvolvido em NestJS que permite o upload de documentos, extração de texto via OCR (Tesseract.js) e análise do conteúdo usando LLM (OpenAI GPT-3.5).

## 🚀 Tecnologias Utilizadas

- NestJS
- MongoDB (via Prisma)
- Tesseract.js (OCR)
- OpenAI GPT-3.5 (LLM)
- JWT para autenticação
- Multer para upload de arquivos

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- MongoDB
- NPM ou Yarn
- Conta na OpenAI (para a chave de API)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env`
   - Preencha as variáveis necessárias (veja seção de Variáveis de Ambiente)

4. Gere o cliente Prisma:
```bash
npm run prisma:generate
```

5. Inicie o servidor em modo desenvolvimento:
```bash
npm run start:dev
```

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Configuração do Banco de Dados
DATABASE_URL="mongodb://localhost:27017/paggo"

# Configuração JWT
JWT_SECRET="seu_segredo_jwt_aqui"

# OpenAI API
OPENAI_API_KEY="sua_chave_api_openai_aqui"

# Configuração do Servidor
PORT=3000
```

## 📁 Estrutura do Projeto

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## ⚠️ Observações Importantes

### Privacidade e Segurança
Por motivos de segurança e privacidade, as seguintes informações não serão compartilhadas no repositório:
- Credenciais do banco de dados MongoDB
- Chave de API da OpenAI
- Tokens de autenticação
- Dados sensíveis de usuários

Para rodar o projeto localmente, você precisará:
1. Criar sua própria conta na OpenAI e gerar uma chave de API
2. Configurar seu próprio banco de dados MongoDB
3. Gerar suas próprias chaves de segurança

### Configuração do Ambiente
O arquivo `.env` contém informações sensíveis e não deve ser compartilhado ou versionado. Um template do arquivo `.env` está disponível como `.env.example`, mas você precisará preencher com suas próprias credenciais.
