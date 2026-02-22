<div align="center">
  <h1>🐱 Agente Caio Corp</h1>
  <p><strong>Plataforma de Agentes de IA Especializados</strong></p>
  <p>
    <a href="https://github.com/gleisson-santos/Caio-Corp/actions"><img src="https://github.com/gleisson-santos/Caio-Corp/actions/workflows/docker-publish.yml/badge.svg" alt="Build"></a>
    <a href="https://hub.docker.com/r/gleissonsantos/caio-dashboard"><img src="https://img.shields.io/docker/pulls/gleissonsantos/caio-dashboard?label=Dashboard%20Pulls&logo=docker" alt="Dashboard Pulls"></a>
    <a href="https://hub.docker.com/r/gleissonsantos/caio-agent"><img src="https://img.shields.io/docker/pulls/gleissonsantos/caio-agent?label=Agent%20Pulls&logo=docker" alt="Agent Pulls"></a>
    <img src="https://img.shields.io/badge/python-≥3.11-blue" alt="Python">
    <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
    <img src="https://img.shields.io/badge/traefik-integrated-24A1C1?logo=traefikproxy&logoColor=white" alt="Traefik">
  </p>
</div>

---

**Agente Caio Corp** é uma plataforma hierárquica de agentes de IA, liderada pelo **Caio** — o CEO digital que orquestra uma equipe de agentes especializados para automatizar tarefas complexas do dia a dia.

> Baseado no framework [nanobot](https://github.com/HKUDS/nanobot), melhorado com sistema de agentes hierárquicos, dashboard web, integração Docker/Traefik e pipeline de deploy profissional via Portainer.

## ✨ O que o Caio faz

| Agente | Função |
|--------|--------|
| 🐱 **Caio** (CEO) | Recebe suas ordens, planeja a estratégia e delega tarefas |
| 🧑‍💻 **Code Analyst** | Auditoria de segurança, refatoração e análise de performance |
| 🎨 **Design Director** | Análise de UI/UX, guidelines de design e prototipagem |
| 📊 **Doc Specialist** | Gera apresentações PPTX e relatórios PDF automaticamente |
| 🛡️ **Email Sentinel** | Monitoramento 24h de e-mails com alertas via Telegram |
| 🕷️ **Web Cloner** | Scraping de dados e clonagem inteligente de sites |
| ✍️ **Content Writer** | Textos persuasivos, artigos, copy e SEO |

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────┐
│                  VPS (Docker)                   │
│  ┌──────────┐   ┌─────────────────────────────┐ │
│  │ Traefik  │──▶│       caio-dashboard        │ │
│  │ (proxy)  │   │  React + Vite + Nginx :80   │ │
│  └──────────┘   └─────────────────────────────┘ │
│       │         ┌─────────────────────────────┐ │
│       └────────▶│       caio-agent            │ │
│                 │  Python 3.12 + Node.js :18790│ │
│                 └─────────────────────────────┘ │
│                 ┌─────────────────────────────┐ │
│                 │      ControllNet (rede)      │ │
│                 └─────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## 📦 Instalação Local

### Pré-requisitos
- Python ≥ 3.11
- Node.js ≥ 18 (para o WhatsApp Bridge)
- Git

### Clone e instale

```bash
git clone https://github.com/gleisson-santos/Caio-Corp.git
cd Caio-Corp
pip install -e .
```

### Configure

Copie o template de configuração e preencha suas chaves:

```bash
cp config.example.json config.json
```

Edite o `config.json` e adicione:

```json
{
  "providers": {
    "openrouter": {
      "apiKey": "SUA_CHAVE_OPENROUTER"
    }
  },
  "channels": {
    "telegram": {
      "enabled": true,
      "token": "SEU_TOKEN_DO_TELEGRAM"
    }
  }
}
```

> **Onde conseguir chaves:**
> [OpenRouter](https://openrouter.ai/keys) · [Brave Search](https://brave.com/search/api/) · [Telegram BotFather](https://t.me/BotFather)

### Execute

```bash
# Chat interativo no terminal
nanobot agent

# Ou inicie o gateway (Telegram, e-mail, etc.)
nanobot gateway
```

## 🐳 Deploy na VPS (Portainer + Traefik)

> As imagens Docker são publicadas **automaticamente** no [Docker Hub](https://hub.docker.com/u/gleissonsantos) via GitHub Actions a cada `git push`.

```
git push → GitHub Actions → Docker Hub → Portainer pull → 🚀 Online
```

### Pré-requisitos do servidor
- VPS com Docker e Docker Swarm
- Portainer instalado
- Traefik configurado com a rede `ControllNet`
- Domínio apontando para a VPS (ex: `agentecaio.controllserv.com.br`)

### Passo a passo

**1. No Portainer:**
- Vá em **Stacks** → **Add stack**
- Nomeie como `caio-corp`
- Cole o conteúdo do `docker-compose.yml`
- Adicione as **Environment Variables**:
  - `OPENAI_API_KEY` → sua chave
  - `TELEGRAM_BOT_TOKEN` → seu token do bot
  - `BRAVE_API_KEY` → sua chave (opcional)
- Clique em **Deploy the stack**

**2. Acesse:**
- Dashboard: `https://agentecaio.controllserv.com.br`
- O Caio Agent roda em background processando mensagens

### Imagens Docker

| Imagem | Pull Command |
|--------|-------------|
| **Dashboard** | `docker pull gleissonsantos/caio-dashboard:latest` |
| **Agent** | `docker pull gleissonsantos/caio-agent:latest` |

### Estrutura da Stack

```yaml
caio-dashboard  → Nginx:80  → Traefik → seu-dominio.com.br
caio-agent      → Python:18790 (interno, sem exposição pública)
```

## 💬 Canais de Chat

Conecte o Caio à sua plataforma favorita.

| Canal | O que precisa |
|-------|--------------|
| **Telegram** | Token do @BotFather |
| **Discord** | Bot token + Message Content intent |
| **WhatsApp** | Scan do QR code |
| **Email** | Credenciais IMAP/SMTP |
| **Slack** | Bot token + App-Level token |

<details>
<summary><b>Telegram</b> (Recomendado)</summary>

**1. Crie um bot**
- Abra o Telegram, busque `@BotFather`
- Envie `/newbot`, siga as instruções
- Copie o token

**2. Configure** (`config.json`)

```json
{
  "channels": {
    "telegram": {
      "enabled": true,
      "token": "SEU_TOKEN",
      "allowFrom": ["SEU_USER_ID"]
    }
  }
}
```

**3. Execute**

```bash
nanobot gateway
```

</details>

<details>
<summary><b>E-mail (Gmail)</b></summary>

**1. Prepare as credenciais**
- Crie uma conta Gmail dedicada (ex: `meu-caio@gmail.com`)
- Ative Verificação em 2 Etapas → Crie uma [Senha de App](https://myaccount.google.com/apppasswords)

**2. Configure** (`config.json`)

```json
{
  "channels": {
    "email": {
      "enabled": true,
      "consentGranted": true,
      "imapHost": "imap.gmail.com",
      "imapPort": 993,
      "imapUsername": "meu-caio@gmail.com",
      "imapPassword": "sua-senha-de-app",
      "smtpHost": "smtp.gmail.com",
      "smtpPort": 587,
      "smtpUsername": "meu-caio@gmail.com",
      "smtpPassword": "sua-senha-de-app",
      "fromAddress": "meu-caio@gmail.com",
      "allowFrom": ["seu-email@gmail.com"]
    }
  }
}
```

**3. Execute**

```bash
nanobot gateway
```

</details>

<details>
<summary><b>WhatsApp</b></summary>

Requer **Node.js ≥18**.

```bash
# Terminal 1: Link do dispositivo
nanobot channels login
# Escaneie o QR com WhatsApp → Configurações → Aparelhos Conectados

# Terminal 2: Inicie o gateway
nanobot gateway
```

</details>

## ⚙️ Providers (Modelos de IA)

| Provider | Uso | Obter Chave |
|----------|-----|-------------|
| `openrouter` | LLM (acesso a todos os modelos) | [openrouter.ai](https://openrouter.ai) |
| `openai` | LLM (GPT direto) | [platform.openai.com](https://platform.openai.com) |
| `anthropic` | LLM (Claude direto) | [console.anthropic.com](https://console.anthropic.com) |
| `deepseek` | LLM (DeepSeek direto) | [platform.deepseek.com](https://platform.deepseek.com) |
| `gemini` | LLM (Gemini direto) | [aistudio.google.com](https://aistudio.google.com) |
| `groq` | LLM + Transcrição de voz | [console.groq.com](https://console.groq.com) |

> Para usar qualquer outro endpoint compatível com OpenAI, configure o provider `custom` com `apiBase` e `apiKey`.

## 🔌 MCP (Model Context Protocol)

O Caio suporta [MCP](https://modelcontextprotocol.io/) — conecte servidores de ferramentas externas.

```json
{
  "tools": {
    "mcpServers": {
      "filesystem": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", "/caminho"]
      }
    }
  }
}
```

## 🔐 Segurança

| Opção | Padrão | Descrição |
|-------|--------|-----------|
| `tools.restrictToWorkspace` | `false` | Quando `true`, restringe todas as ferramentas ao diretório workspace |
| `channels.*.allowFrom` | `[]` | Lista de IDs permitidos. Vazio = permite todos |

> **Nunca** versione o `config.json` com suas chaves. Use sempre o `config.example.json` como template.

## 🖥️ Referência CLI

| Comando | Descrição |
|---------|-----------|
| `nanobot onboard` | Inicializar config e workspace |
| `nanobot agent` | Chat interativo com o Caio |
| `nanobot agent -m "..."` | Enviar uma mensagem direta |
| `nanobot gateway` | Iniciar o gateway (Telegram, Email, etc.) |
| `nanobot status` | Mostrar status do sistema |
| `nanobot channels login` | Vincular WhatsApp (QR) |
| `nanobot channels status` | Status dos canais |
| `nanobot cron list` | Listar tarefas agendadas |

## 📁 Estrutura do Projeto

```
Caio-Corp/
├── dashboard/        # 🖥️ Frontend React (Painel de Controle)
│   ├── src/          #    Componentes e design system
│   ├── Dockerfile    #    Build multi-stage (Node → Nginx)
│   └── nginx.conf    #    SPA routing + cache
├── nanobot/          # 🧠 Core do agente
│   ├── agent/        #    Lógica do agente, tools, subagents
│   ├── skills/       #    Biblioteca de skills especializadas
│   ├── channels/     #    Integrações de chat
│   ├── providers/    #    Providers de LLM
│   └── extras/       #    Geração de documentos (PPTX, PDF, XLSX)
├── workspace/        # 📂 Memória e contexto do agente
├── docker-compose.yml # 🐳 Stack para Portainer
├── Dockerfile        # 🐳 Build do agente
└── config.example.json # ⚙️ Template de configuração (sem segredos)
```

## 📝 Licença

MIT License — Uso livre para fins educacionais, pesquisa e produção.

---

<p align="center">
  <strong>🐱 Caio Corp — Sua equipe de IA, trabalhando 24/7.</strong>
</p>
