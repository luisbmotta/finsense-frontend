# FinSense Frontend

Plataforma de inteligência financeira omnichannel voltada para jovens de 18 a 30 anos, desenvolvida em parceria com a **Claro**.

---

> ⚠️ **Este repositório contém apenas o frontend da aplicação.**
> O backend em **Java 17 + Spring Boot** está sendo desenvolvido em repositório separado e ainda não está disponível publicamente. Os dados exibidos atualmente são mockados diretamente no frontend.

---

## Telas implementadas

| Tela | Descrição |
|------|-----------|
| Login / Cadastro | Autenticação com toggle entre login e cadastro |
| Dashboard | Visão geral com saldo, gráfico de categorias e transações recentes |
| Cadastro de Gastos | Formulário com valor, categoria, data e descrição |
| Extrato | Histórico de transações com filtros por categoria e mês |
| Metas Financeiras | Cards de metas com barra de progresso e valor atual vs. alvo |
| Insights com IA | Score de saúde financeira, análise de gastos e dicas personalizadas |

## Stack técnica

- **Angular 17** — standalone components, novo control flow (`@if`, `@for`)
- **Angular Material 17** — componentes MDC para UI
- **TypeScript 5.2**
- **Signals & Computed** — gerenciamento de estado reativo sem NgRx
- **Angular Router** — lazy loading com `loadComponent` por rota
- **SCSS** — tema customizado azul/verde com CSS custom properties
- **Material Icons** — fonte servida localmente via npm

## Como rodar localmente

**Pré-requisitos:** Node.js 18+ e npm 9+

```bash
# Clone o repositório
git clone https://github.com/luisbmotta/finsense-frontend.git
cd finsense-frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
ng serve
```

Acesse **http://localhost:4200** no navegador.

> Para fazer login, utilize qualquer e-mail válido e senha com 6+ caracteres. Os dados são mockados — nenhum backend é necessário.

## Estrutura do projeto

```
src/
├── app/
│   ├── app.config.ts          # Providers globais e locale pt-BR
│   ├── app.routes.ts          # Rotas com lazy loading
│   ├── models/                # Interfaces e constantes de domínio
│   ├── services/
│   │   └── finance.service.ts # Estado mock com Signals
│   ├── components/
│   │   ├── shell/             # Layout com router-outlet
│   │   └── bottom-nav/        # Navegação inferior com FAB
│   └── pages/
│       ├── auth/
│       ├── dashboard/
│       ├── add-expense/
│       ├── transactions/
│       ├── goals/
│       └── insights/
└── styles.scss                # Tema global Angular Material
```

## Desenvolvedores

| Nome | RM |
|------|----|
| Luis Fernando de Barros Motta | RM 95664 |
| Eduardo Lucca Dias da Costa | RM 95415 |

---

**Projeto Acadêmico — FIAP 2026**
