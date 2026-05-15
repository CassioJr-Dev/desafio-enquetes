# Desafio Enquetes API

API para criacao de enquetes, registro de votos e distribuicao de atualizacoes em tempo real via WebSocket.

## Visao geral

O projeto foi construido com foco em separacao de responsabilidades, testabilidade e simplicidade operacional:

- `Fastify` para HTTP e WebSocket
- `Prisma` com PostgreSQL para persistencia
- `Zod` para validacao de entrada no nivel do controller
- `Vitest` para testes unitarios e end-to-end
- `Scalar` + `OpenAPI` para documentacao da API

O dominio principal e o modulo de enquetes, que concentra:

- criacao de enquetes
- listagem geral e por status
- atualizacao e remocao
- registro de votos
- notificacao realtime de votos

## Funcionalidades

- Criar enquetes com no minimo 3 opcoes
- Garantir que as opcoes sejam unicas
- Validar intervalo de datas
- Listar enquetes por status
- Registrar votos por opcao
- Publicar snapshot inicial e atualizacoes de votos via WebSocket

## Estrutura do projeto

```text
src/
  app.ts
  server.ts
  http/
    docs/
      apiDocs.ts
  pollModule/
    core/
      application/useCases/
      entities/
      enum/
      exceptions/
      repositories/
      useCase/
    http/
      controllers/
      docs/
      interceptors/
      presenters/
      realtime/
      routes/
      schemas/
    persistence/
      migrations/
      prisma/
      repositories/
      schema.prisma
tests/
  e2e/
  helpers/
  unit/
scripts/
  deploy-production.mjs
```

## Responsabilidade de cada camada

### `src/server.ts`

Ponto de entrada da aplicacao. Carrega variaveis de ambiente com `dotenv`, monta a app e sobe o servidor usando `PORT`, com fallback para `3000`.

### `src/app.ts`

Responsavel pela composicao da aplicacao:

- cria a instancia do Fastify
- registra a documentacao OpenAPI
- registra a rota raiz `/`
- registra o modulo de enquetes

### `pollModule/core`

Camada de dominio e aplicacao.

- `entities/`: definem as estruturas centrais como `PollEntity`, `OptionEntity` e `VoteEntity`
- `application/useCases/`: contem as regras de negocio e os casos de uso
- `repositories/`: define contratos abstratos de persistencia
- `exceptions/`: encapsula erros de dominio e validacao

Essa camada nao depende de Fastify nem de Prisma. Isso reduz acoplamento e facilita testes.

### `pollModule/http`

Camada de entrega da API.

- `routes/`: mapeia endpoints HTTP e WebSocket
- `controllers/`: traduz request em chamadas para casos de uso
- `schemas/`: validacao via Zod
- `docs/`: contratos OpenAPI das rotas
- `presenters/`: transforma entidades em resposta HTTP e realtime
- `interceptors/`: centraliza o tratamento de erros
- `realtime/`: gerencia assinaturas WebSocket por enquete

### `pollModule/persistence`

Camada de infraestrutura.

- `schema.prisma`: modelagem do banco
- `prisma/`: criacao do client Prisma
- `repositories/`: implementacao concreta do contrato `PollRepository`
- `migrations/`: historico versionado do banco

## Fluxo da requisicao

Em alto nivel, uma requisicao percorre o seguinte caminho:

1. A rota Fastify recebe a chamada.
2. O schema OpenAPI/Ajv valida o formato HTTP basico.
3. O controller aplica validacao estrutural com Zod.
4. O controller chama o caso de uso adequado.
5. O caso de uso executa validacoes e regras de negocio.
6. O repositorio persiste ou consulta os dados.
7. O presenter monta a resposta final.
8. O interceptor converte erros tecnicos e de dominio em respostas HTTP consistentes.

## Rotas principais

### HTTP

- `POST /polls`
- `GET /polls`
- `GET /polls/status/:status`
- `PUT /polls/:pollId`
- `DELETE /polls/:pollId`
- `POST /polls/:pollId/votes`

### Realtime

- `GET /polls/:pollId/votes/ws`

Quando um cliente conecta no WebSocket:

- recebe primeiro um snapshot do estado atual da enquete
- depois passa a receber eventos de atualizacao sempre que um novo voto e registrado

## Documentacao da API

- UI: `/docs/`
- OpenAPI JSON: `/openapi.json`

Observacao: a rota WebSocket aparece documentada no OpenAPI, mas a interacao realtime precisa ser testada com um cliente WebSocket, como Insomnia ou `wscat`.

## Modelo de dados

O banco possui tres entidades principais:

- `Poll`: representa a enquete
- `Option`: representa uma opcao da enquete e armazena `votesCount`
- `Vote`: representa cada voto registrado

Relacoes:

- uma enquete possui muitas opcoes
- uma enquete possui muitos votos
- uma opcao pode receber muitos votos

## Decisoes tecnicas e de arquitetura

### 1. Arquitetura em camadas

A estrutura separa dominio, entrega HTTP e persistencia. Isso deixa o codigo mais facil de evoluir e reduz o impacto de trocar detalhes de infraestrutura.

### 2. Repositorio como contrato

Os casos de uso dependem da interface `PollRepository`, nao da implementacao concreta. Isso permitiu:

- usar `PrismaPollRepository` em producao
- usar `InMemoryPollRepository` nos testes

Essa decisao melhora bastante a testabilidade.

### 3. Validacao em tres camadas

O projeto usa tres niveis complementares de validacao:

- `Ajv` via schema das rotas para validar o contrato HTTP antes do controller
- `Zod` no controller para validar a estrutura da entrada e fazer coercao de tipos, como string para `Date`
- use cases e utilitarios de dominio para aplicar regras de negocio que nao devem depender da camada HTTP

Exemplo pratico:

- `Ajv` garante que `startDate` chegue como `date-time` e que `options` tenha no minimo 3 itens
- `Zod` transforma as datas em objetos `Date` e reforca o formato esperado para a aplicacao
- os use cases validam regras como data final maior que data inicial, opcoes unicas e bloqueio de alteracao de opcoes apos votos

Essa abordagem deixa a API mais robusta e torna os erros mais previsiveis sem concentrar toda a responsabilidade em um unico ponto.

### 4. Regras de negocio centralizadas em use cases

Exemplos de regras implementadas:

- titulo da enquete nao pode ser vazio
- enquete precisa ter pelo menos 3 opcoes
- opcoes devem ser unicas
- data final deve ser maior que a inicial
- opcoes nao podem ser alteradas depois que votos ja foram registrados

Essas regras ficam fora de controller e repositorio para preservar a clareza da responsabilidade de cada camada.

### 5. `votesCount` por opcao e `votes` por historico

O sistema mantem:

- `votesCount` dentro de cada opcao, para leitura rapida do placar
- registros individuais em `Vote`, para manter historico e permitir calcular o total geral

Hoje, o `totalVotes` exposto pela API e derivado de `poll.votes.length`, enquanto o placar por opcao usa `option.votesCount`.

### 6. Realtime desacoplado do HTTP

O `PollRealtimeGateway` concentra a gestao das conexoes WebSocket:

- registra assinantes por `pollId`
- envia snapshot inicial
- publica atualizacoes apos novos votos
- remove conexoes fechadas

Isso evita espalhar logica de socket pelo controller.

### 7. Carregamento de ambiente com `dotenv`

O runtime da aplicacao usa `dotenv` para carregar variaveis de ambiente a partir do arquivo `.env`, mantendo o bootstrap simples e aderente ao padrao mais comum do ecossistema Node.js.

## Variaveis de ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/desafioEnquetes_test?schema=public"
PORT=3000
```

## Como rodar localmente

### 1. Subir o banco

```bash
docker compose up -d
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Gerar client Prisma

```bash
npx prisma generate
```

### 4. Aplicar migrations

```bash
npx prisma migrate deploy
```

### 5. Rodar em desenvolvimento

```bash
npm run dev
```

Servidor local:

- `http://localhost:3000`
- docs em `http://localhost:3000/docs/`

## Scripts disponiveis

- `npm run dev`: sobe a API em modo desenvolvimento
- `npm run build`: compila TypeScript para `dist/`
- `npm run start`: executa a versao compilada
- `npm run prod`: build + start
- `npm test`: executa toda a suite
- `npm run test:unit`: executa testes unitarios
- `npm run test:e2e`: executa o fluxo principal HTTP
- `npm run test:e2e:websocket`: executa o fluxo realtime
- `npm run deploy:prod`: instala dependencias, gera Prisma, aplica migrations, compila e sobe a app

## Testes

O projeto possui:

- testes unitarios de casos de uso
- testes unitarios de controllers e gateway realtime
- testes end-to-end para fluxos HTTP
- testes end-to-end para WebSocket

Essa distribuicao ajuda a cobrir tanto regras de negocio quanto integracao entre camadas.

## Possiveis evolucoes

- autenticacao e autorizacao
- paginacao e filtros mais ricos
- observabilidade com logs estruturados
- fila ou broker para escalar o realtime horizontalmente
- suporte a encerramento automatico de enquetes por data
