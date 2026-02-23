# Heartbeat Tasks

This file is checked every 30 minutes by your nanobot agent.
Add tasks below that you want the agent to work on periodically.

If this file has no tasks (only headers and comments), the agent will skip the heartbeat.

## Active Tasks

- [ ] Verificar eventos do calendário. Se houver compromissos começando nos próximos 30 minutos, use a ferramenta `message` para me avisar proativamente (ex: "Caio passando para avisar que você tem [Evento] em 15 minutos!").
- [ ] Checar caixa de entrada de email. Use `email_read` com `query="UNSEEN"` e `max_results=5`. Se houver emails novos não lidos, envie um resumo usando a ferramenta `message` (ex: "📧 Você tem 3 emails novos: [resumo do remetente e assunto de cada]").

## Completed

<!-- Move completed tasks here or delete them -->

