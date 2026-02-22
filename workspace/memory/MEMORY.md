# Long-term Memory

This file stores important information that should persist across sessions.

## User Information

(Important facts about the user)

## Preferences

(User preferences learned over time)

## Project Context

(Information about ongoing projects)

## Important Notes

(Things to remember)

## Histórico de Melhorias

### [2026-02-22] - Melhorias de Confiabilidade e Persona
- **Model Fallback Mechanism**: Implementado sistema de redundância que troca automaticamente de modelo se o principal falhar (quota ou erro de API). Configurado com lista de modelos gratuitos (Trinity, DeepSeek, StepFun, etc).
- **Integração de Email**: Criada ferramenta `EmailSendTool` com suporte a SMTP e correção de codificação (fix para caracteres especiais como `ã`, `é`).
- **Google Calendar**: 
    - Implementada ação `update` para editar eventos existentes sem duplicar.
    - Configurado fuso horário local (`America/Sao_Paulo`) para agendamentos precisos.
- **Reforço de Persona (Caio)**: Atualizada a identidade do sistema para garantir respostas sempre em **Português (PT-BR)**, tom alegre e comportamento proativo.
- **Configuração**: Adicionados campos `fallback_models` e `timezone` ao `config.json`.
- **Refino de Workspace (Caio 2.0)**:
  - `USER.md`: Atualizado com perfil técnico (Docker, Swarm) sem limitar a versatilidade do Caio para tarefas importantes.
  - `TOOLS.md`: Documentação das novas ferramentas de E-mail e Calendário adicionada.
  - `AGENTS.md`: Instruções sobre resiliência e fallback de modelos integradas.
  - `HEARTBEAT.md`: Iniciado com tarefas de checagem proativa de calendário e e-mails.

### [2026-02-22] - Estabilização de Lembretes e Busca de E-mail Pro
- **Estabilização do Cron**: Implementada trava de segurança que desativa lembretes de execução única *antes* da execução, prevenindo loops infinitos em caso de falha.
- **Correção de Crash de Log**: Resolvido erro de escopo de `logger` no callback do gateway que causava travamentos silenciosos.
- **Estética do Chat (Supressão)**: Refinado o filtro de `AgentLoop` para esconder termos técnicos como `cron`, `email_read` e `google_calendar`, mantendo o chat limpo e humano.
- **Busca de E-mail em 4 Fases**: Nova ferramenta `email_read` com busca sequencial inteligente (Remetente -> Assunto -> Texto -> Primeiro Nome Fallback), otimizada para o comportamento do Gmail/IMAP.
- **Lembretes Diretos**: Implementada via rápida de entrega para notificações simples, reduzindo latência e evitando poluição do contexto do agente.
- **Organização**: Faxina nos logs antigos e remoção de pastas temporárias para manter o projeto limpo.
- **Versionamento Git**: Iniciado repositório Git em `gleisson-santos/Caio-Corp`. Todas as melhorias futuras serão registradas via commit e resumidas no MEMORY.md.

*Este arquivo é atualizado pelo nanobot para manter um registro persistente da evolução do projeto.*
