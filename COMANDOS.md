# 📋 Comandos de Referência — Caio Corp

Guia rápido de comandos para gerenciar o agente no **Desktop (Windows)** e na **VPS (Linux/Docker Swarm)**.

---

## 🖥️ Desktop (Windows — PowerShell)

### Gateway (Agente Local)

| Ação | Comando |
|------|---------|
| **Iniciar gateway** | `$env:PYTHONIOENCODING='utf-8'; python -m nanobot.cli.commands gateway` |
| **Parar gateway** | `Ctrl+C` no terminal |
| **Matar todos os processos Python** | `Get-Process python -EA SilentlyContinue \| Stop-Process -Force` |
| **Verificar processos ativos** | `Get-Process python -EA SilentlyContinue \| Select Id, StartTime` |

### Git — Enviar Atualizações

| Ação | Comando |
|------|---------|
| **Commitar mudanças** | `git add . ; git commit -m "descrição"` |
| **Enviar para GitHub** | `git push origin main` |
| **Ver últimos commits** | `git log --oneline -5` |
| **Ver status** | `git status` |

---

## 🌐 VPS (Linux — Terminal SSH)

### Git — Receber Atualizações

```bash
cd ~/Caio-Corp
git pull origin main
```

### Docker — Rebuild e Deploy

| Ação | Comando |
|------|---------|
| **Rebuild da imagem do agente** | `docker build -t gleissonsantos/caio-agent:latest .` |
| **Rebuild do dashboard** | `docker build -t gleissonsantos/caio-dashboard:latest ./dashboard` |
| **Deploy/Update da stack** | `docker stack deploy -c docker-compose.yml caio-corp` |
| **Rebuild + Deploy (tudo junto)** | Ver sequência completa abaixo |

#### 🔄 Sequência Completa de Atualização

```bash
cd ~/Caio-Corp
git pull origin main
docker build -t gleissonsantos/caio-agent:latest .
docker build -t gleissonsantos/caio-dashboard:latest ./dashboard
docker stack deploy -c docker-compose.yml caio-corp
```

### Docker — Gerenciar Containers

| Ação | Comando |
|------|---------|
| **Ver containers rodando** | `docker ps` |
| **Ver todos (incluindo parados)** | `docker ps -a` |
| **Logs do agente (tempo real)** | `docker service logs caio-corp_caio-agent -f --tail=50` |
| **Logs do dashboard** | `docker service logs caio-corp_caio-dashboard -f --tail=50` |
| **Reiniciar serviço do agente** | `docker service update --force caio-corp_caio-agent` |
| **Reiniciar serviço do dashboard** | `docker service update --force caio-corp_caio-dashboard` |
| **Parar todos os serviços** | `docker stack rm caio-corp` |

### Docker — Manutenção

| Ação | Comando |
|------|---------|
| **Limpar imagens não usadas** | `docker image prune -f` |
| **Limpar tudo (imagens, volumes, cache)** | `docker system prune -af` |
| **Ver uso de disco do Docker** | `docker system df` |
| **Listar volumes** | `docker volume ls` |
| **Listar redes** | `docker network ls` |

### Docker Swarm

| Ação | Comando |
|------|---------|
| **Ver serviços da stack** | `docker stack services caio-corp` |
| **Ver tasks/replicas** | `docker service ps caio-corp_caio-agent` |
| **Escalar replicas** | `docker service scale caio-corp_caio-agent=2` |

### Config do Agente na VPS

O `config.json` fica montado como volume de fora do container:

```
/root/Caio-Corp/config.json → /root/.nanobot/config.json (dentro do container)
```

Para editar:
```bash
nano ~/Caio-Corp/config.json
```

Após editar o config, reiniciar o serviço:
```bash
docker service update --force caio-corp_caio-agent
```

---

## ⚡ Atalhos Rápidos

### Atualizar VPS após mudanças no Desktop

```bash
# 1. No Desktop (PowerShell):
git add . ; git commit -m "descrição" ; git push origin main

# 2. Na VPS (SSH):
cd ~/Caio-Corp && git pull origin main
docker build -t gleissonsantos/caio-agent:latest . && docker stack deploy -c docker-compose.yml caio-corp
```

### Reiniciar tudo do zero na VPS

```bash
docker stack rm caio-corp
sleep 10
docker build -t gleissonsantos/caio-agent:latest .
docker build -t gleissonsantos/caio-dashboard:latest ./dashboard
docker stack deploy -c docker-compose.yml caio-corp
```

### Verificar saúde do sistema

```bash
docker stack services caio-corp
docker service logs caio-corp_caio-agent --tail=20
```

---

## ⚠️ Notas Importantes

1. **Tokens diferentes**: Desktop e VPS usam tokens de bot Telegram diferentes — ambos podem rodar simultaneamente
2. **Config na VPS**: O arquivo `~/Caio-Corp/config.json` é montado no container — edite ele diretamente, não o de dentro do container
3. **Rede Swarm**: Use `docker stack deploy`, NUNCA `docker compose up` (a rede `ControllNet` é overlay do Swarm)
4. **Rebuild obrigatório**: Após `git pull`, SEMPRE fazer `docker build` antes de `docker stack deploy`
5. **Portainer**: Pode usar o Portainer para pausar/reiniciar containers, mas NÃO para rebuild — rebuild só pelo terminal
