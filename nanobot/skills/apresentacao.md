_# SKILL: Analista de Dados Gerencial Automatizado_

## 1. Descrição

Esta skill automatiza o fluxo de trabalho de ponta a ponta para análise de dados operacionais, geração de relatórios gerenciais e criação de apresentações executivas. A skill foi projetada com base nas análises de dados de ordens de serviço (como as da Embasa) e é otimizada para transformar dados brutos em insights acionáveis e visuais, prontos para apresentação.

O processo completo envolve três fases principais: **Análise de Dados**, **Geração de Relatórios** e **Criação de Apresentações**.

---

## 2. Fluxo de Trabalho (Workflow)

### Fase 1: Análise de Dados

O ponto de partida é um arquivo de dados brutos, tipicamente em formato `.xlsx` ou `.csv`.

| Passo | Ação | Ferramentas Sugeridas | Detalhes |
| :-- | :--- | :--- | :--- |
| **1.1** | **Carregamento e Limpeza** | `Python (pandas)` | Carrega o arquivo, remove duplicatas, trata dados ausentes e padroniza os nomes das colunas (ex: `Tramitação da OS` para `tramitacao`, `Encerramento` para `encerramento`). |
| **1.2** | **Análise de Métricas Chave** | `Python (pandas)` | Calcula as principais métricas de negócio, como: <br> - Volume de chamados por tipo/mês <br> - Tempo médio de atendimento <br> - Análise de reincidência (ex: recorrência em menos de 3 dias) <br> - Identificação de gargalos operacionais (ex: tempo entre vazamento e reparo de pavimento). |
| **1.3** | **Geração de Gráficos** | `Python (matplotlib, seaborn)` | Cria visualizações de dados para suportar as análises, como gráficos de barras, linhas e dispersão. Salva os gráficos como arquivos de imagem (`.png`). |
| **1.4** | **Consolidação dos Dados** | `Python (pandas)` | Agrupa os dados analisados e as conclusões em um novo arquivo Excel (`.xlsx`), com cada aba representando uma análise específica. |

### Fase 2: Geração de Relatórios

Com os dados analisados e consolidados, a skill gera um relatório gerencial em formato Markdown (`.md`).

| Passo | Ação | Ferramentas Sugeridas | Detalhes |
| :-- | :--- | :--- | :--- |
| **2.1** | **Estruturação do Relatório** | `file` | Cria um arquivo `.md` com uma estrutura clara: Título, Sumário Executivo, Análises Detalhadas (com tabelas e gráficos) e Conclusões. |
| **2.2** | **Síntese dos Insights** | `N/A` | Resume as principais descobertas da análise de dados em texto claro e conciso, focado em insights para a gestão. |
| **2.3** | **Incorporação de Visuais** | `Markdown` | Insere os gráficos gerados na Fase 1 e tabelas formatadas para facilitar a leitura e a compreensão dos dados. |

### Fase 3: Criação de Apresentações

A etapa final é a criação de uma apresentação de slides profissional, pronta para ser exibida.

| Passo | Ação | Ferramentas Sugeridas | Detalhes |
| :-- | :--- | :--- | :--- |
| **3.1** | **Definição do Estilo** | `slide_initialize` | O usuário define a identidade visual: <br> - **Paleta de Cores**: Cores primárias, secundárias e de destaque (ex: `#005691` para Embasa). <br> - **Tipografia**: Fontes para títulos e corpo de texto. <br> - **Estilo Estético**: Direção de arte (ex: "Estilo Suíço Internacional"). |
| **3.2** | **Criação do Outline** | `slide_initialize` | Com base no relatório `.md`, a skill cria um `outline` para a apresentação, definindo o título e o resumo de cada slide. |
| **3.3** | **Desenvolvimento dos Slides** | `slide_edit` | Para cada slide do `outline`, a skill gera o código HTML/CSS, posicionando títulos, textos, e inserindo os gráficos e imagens relevantes. O layout deve ser limpo, profissional e consistente com a identidade visual definida. |
| **3.4** | **Apresentação Final** | `slide_present` | A skill renderiza a apresentação final e a disponibiliza para o usuário através de um link `manus-slides://`. O usuário pode então visualizar e exportar a apresentação em formato `.pptx`. |

---

## 3. Requisitos de Entrada

Para executar esta skill, o usuário precisa fornecer:

1.  **Arquivo de Dados**: Um arquivo `.xlsx` ou `.csv` contendo os dados brutos a serem analisados.
2.  **Diretrizes de Análise (Opcional)**: Métricas específicas a serem investigadas (ex: "analisar reincidência de vazamentos em um intervalo de 5 dias").
3.  **Identidade Visual (Para Apresentação)**:
    *   **Paleta de Cores**: Uma lista de cores em códigos hexadecimais.
    *   **Tipografia**: Nomes das fontes desejadas (preferencialmente do Google Fonts).
    *   **Direção de Estilo**: Uma breve descrição do estilo visual (ex: "minimalista e corporativo").

---

## 4. Saídas (Deliverables)

Ao final do processo, a skill entrega os seguintes artefatos:

1.  **Relatório Analítico em Excel (`.xlsx`)**: Uma planilha contendo todas as tabelas de dados, análises e métricas calculadas.
2.  **Gráficos (`.png`)**: Arquivos de imagem individuais para cada gráfico gerado.
3.  **Relatório Gerencial em Markdown (`.md`)**: Um documento de texto com o resumo das análises, insights e visualizações de dados.
4.  **Apresentação de Slides (`manus-slides://` e `.pptx`)**: O link para a apresentação final, pronta para ser visualizada e exportada.

---

## 5. Exemplo de Uso (Prompt)

```
"Analise o arquivo de dados em anexo (`AnalisademandasRuaWanderleydePinho.xlsx`). Quero um relatório gerencial focado em reincidência de serviços e tempo de execução. Ao final, crie uma apresentação de 5 slides com a identidade visual da Embasa (cores azul #005691 e branco) e um estilo de design Suíço."
```
