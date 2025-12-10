# Data Integration App

Aplicação em **Node.js + TypeScript** para integração de dados.  
Permite extrair dados de diferentes fontes, aplicar transformações e exportar para múltiplos destinos (CSV, JSON, etc.).

---

## 🚀 Funcionalidades
- Conectores:
  - `http-json`: consome dados de APIs REST que retornam JSON.
  - `csv-local`: lê dados de arquivos CSV locais.
- Transformações:
  - Mapeamento de campos (`id`, `nome`, `email`, etc.).
  - Suporte a scripts customizados (em breve).
- Exportadores:
  - `csv`: salva dados em arquivo CSV.
  - `json`: salva dados em arquivo JSON.
- Execução:
  - **CLI**: roda pipelines definidos em YAML.
  - **API REST**: expõe endpoint para executar pipelines via HTTP.

---

## 📦 Instalação

Clone o repositório e instale dependências:

```bash
git clone https://github.com/seu-usuario/data-integration-app.git
cd data-integration-app
npm install
▶️ Uso via CLI
Execute o pipeline padrão:

bash
npm run dev:cli
Ou especifique outro arquivo de configuração:

bash
ts-node src/cli.ts config/usuarios.yaml
🌐 Uso via API
Suba o servidor:

bash
npm run dev:api
Por padrão, roda em http://localhost:3000.

Endpoints
POST /run → executa pipeline definido em config/default.yaml Exemplo:

bash
curl -X POST http://localhost:3000/run
⚙️ Configuração
Os pipelines são definidos em arquivos YAML (config/*.yaml).

Exemplo (config/default.yaml):

yaml
source:
  type: http-json
  params:
    url: https://jsonplaceholder.typicode.com/users

transform:
  mapping:
    id: id
    nome: name
    email: email

destinations:
  - type: csv
    params:
      path: out/dados.csv
  - type: json
    params:
      path: out/dados.json
📂 Estrutura do projeto
Código
src/
  cli.ts              # Entrada CLI
  server.ts           # Servidor Express
  core/
    pipeline.ts       # Execução do pipeline
    transform.ts      # Transformações
  connectors/
    httpJson.ts       # Conector HTTP-JSON
    csvLocal.ts       # Conector CSV local
  exporters/
    csvExporter.ts    # Exportador CSV
    jsonExporter.ts   # Exportador JSON
  utils/
    config.ts         # Carregamento de config
    logger.ts         # Logger simples
🛠️ Desenvolvimento
TypeScript + ts-node

Express para API

js-yaml para configuração

node-fetch para chamadas HTTP

📜 Licença
MIT

Código

---

👉 Esse README já está pronto para colocar na raiz do projeto. Quer que eu adapte para incluir também **exemplos de saída** (como o conteúdo gerado em `out/dados.csv` e `out/dados.json`) para deixar ainda mais didático?