# Data Integration App

Pipeline de integração de dados com conectores plugáveis, transformações e exportadores.

## Como usar
- Rodar via CLI:
  npm run dev:cli
- Rodar API:
  npm run dev:api
  curl -X POST http://localhost:3000/run

## Config
Edite config/default.yaml para definir:
- source.type (http-json, csv-local)
- transform.mapping
- destination.type (csv, json) e params.path
