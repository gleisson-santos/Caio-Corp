#!/usr/bin/env python3
"""
Gerador de documentos PDF
Uso: python generate_pdf.py [arquivo_saida.pdf]

Dependências: pip install reportlab
"""

from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.units import cm, mm, inch
from reportlab.lib.colors import HexColor, black, white, red, blue, green, gray
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, ListFlowable, ListItem
)
from reportlab.graphics.shapes import Drawing, Rect, String, Line
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.charts.linecharts import HorizontalLineChart
import sys
import os

# === CORES PADRÃO ===
AZUL_ESCURO = HexColor('#1F4E79')
AZUL_CLARO = HexColor('#4472C4')
CINZA = HexColor('#595959')
CINZA_CLARO = HexColor('#D9E2F3')

def criar_estilos():
    """Cria estilos personalizados"""
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name='TituloPrincipal',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=AZUL_ESCURO,
        alignment=TA_CENTER,
        spaceAfter=30,
        spaceBefore=20,
    ))

    styles.add(ParagraphStyle(
        name='Subtitulo',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=AZUL_CLARO,
        spaceAfter=12,
        spaceBefore=20,
    ))

    styles.add(ParagraphStyle(
        name='TextoNormal',
        parent=styles['Normal'],
        fontSize=11,
        textColor=black,
        alignment=TA_JUSTIFY,
        spaceAfter=10,
        leading=16,
    ))

    styles.add(ParagraphStyle(
        name='Rodape',
        parent=styles['Normal'],
        fontSize=9,
        textColor=gray,
        alignment=TA_CENTER,
    ))

    return styles

def criar_grafico_barras(dados, categorias, titulo="Gráfico"):
    """Cria gráfico de barras"""
    drawing = Drawing(400, 200)

    bc = VerticalBarChart()
    bc.x = 50
    bc.y = 50
    bc.height = 125
    bc.width = 300
    bc.data = dados
    bc.categoryAxis.categoryNames = categorias
    bc.valueAxis.valueMin = 0
    bc.valueAxis.valueMax = max(max(d) for d in dados) * 1.2
    bc.bars[0].fillColor = AZUL_ESCURO
    if len(dados) > 1:
        bc.bars[1].fillColor = AZUL_CLARO

    drawing.add(bc)

    # Título
    drawing.add(String(200, 185, titulo, textAnchor='middle', fontSize=12, fillColor=AZUL_ESCURO))

    return drawing

def criar_grafico_pizza(dados, labels, titulo="Distribuição"):
    """Cria gráfico de pizza"""
    drawing = Drawing(300, 200)

    pie = Pie()
    pie.x = 100
    pie.y = 25
    pie.width = 100
    pie.height = 100
    pie.data = dados
    pie.labels = labels
    pie.slices.strokeWidth = 0.5

    cores = [AZUL_ESCURO, AZUL_CLARO, HexColor('#70AD47'), HexColor('#FFC000'), HexColor('#C00000')]
    for i, cor in enumerate(cores[:len(dados)]):
        pie.slices[i].fillColor = cor

    drawing.add(pie)
    drawing.add(String(150, 180, titulo, textAnchor='middle', fontSize=12, fillColor=AZUL_ESCURO))

    return drawing

def criar_pdf(caminho_saida="out/documento.pdf"):
    """Cria um documento PDF de exemplo"""

    # Criar diretório
    os.makedirs(os.path.dirname(caminho_saida) if os.path.dirname(caminho_saida) else '.', exist_ok=True)

    doc = SimpleDocTemplate(
        caminho_saida,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )

    styles = criar_estilos()
    elementos = []

    # === TÍTULO ===
    elementos.append(Paragraph("Relatório de Exemplo", styles['TituloPrincipal']))
    elementos.append(Paragraph("Documento gerado automaticamente", styles['Rodape']))
    elementos.append(Spacer(1, 30))

    # === INTRODUÇÃO ===
    elementos.append(Paragraph("1. Introdução", styles['Subtitulo']))
    elementos.append(Paragraph(
        "Este é um documento PDF de exemplo criado com a biblioteca ReportLab. "
        "Ele demonstra as principais funcionalidades disponíveis para geração de "
        "documentos profissionais com Python.",
        styles['TextoNormal']
    ))
    elementos.append(Spacer(1, 10))

    # === LISTA ===
    elementos.append(Paragraph("2. Características", styles['Subtitulo']))

    itens = [
        "Formatação de texto (negrito, itálico, cores)",
        "Tabelas com estilos personalizados",
        "Gráficos de barras e pizza",
        "Quebras de página automáticas",
        "Cabeçalhos e rodapés"
    ]

    lista = ListFlowable(
        [ListItem(Paragraph(item, styles['TextoNormal'])) for item in itens],
        bulletType='bullet',
        leftIndent=20,
    )
    elementos.append(lista)
    elementos.append(Spacer(1, 20))

    # === TABELA ===
    elementos.append(Paragraph("3. Dados de Exemplo", styles['Subtitulo']))

    dados_tabela = [
        ['Mês', 'Vendas', 'Custos', 'Lucro'],
        ['Janeiro', 'R$ 15.000', 'R$ 8.000', 'R$ 7.000'],
        ['Fevereiro', 'R$ 18.000', 'R$ 9.500', 'R$ 8.500'],
        ['Março', 'R$ 22.000', 'R$ 11.000', 'R$ 11.000'],
        ['Abril', 'R$ 19.500', 'R$ 10.200', 'R$ 9.300'],
        ['Total', 'R$ 74.500', 'R$ 38.700', 'R$ 35.800'],
    ]

    tabela = Table(dados_tabela, colWidths=[3*cm, 3.5*cm, 3.5*cm, 3.5*cm])
    tabela.setStyle(TableStyle([
        # Cabeçalho
        ('BACKGROUND', (0, 0), (-1, 0), AZUL_ESCURO),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        # Total
        ('BACKGROUND', (0, -1), (-1, -1), CINZA_CLARO),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        # Corpo
        ('FONTNAME', (0, 1), (-1, -2), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, gray),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))

    elementos.append(tabela)
    elementos.append(Spacer(1, 30))

    # === GRÁFICO DE BARRAS ===
    elementos.append(Paragraph("4. Visualização dos Dados", styles['Subtitulo']))

    grafico = criar_grafico_barras(
        [[15000, 18000, 22000, 19500], [8000, 9500, 11000, 10200]],
        ['Jan', 'Fev', 'Mar', 'Abr'],
        'Vendas vs Custos'
    )
    elementos.append(grafico)
    elementos.append(Spacer(1, 20))

    # === GRÁFICO DE PIZZA ===
    pizza = criar_grafico_pizza(
        [35, 25, 20, 12, 8],
        ['Produto A', 'Produto B', 'Produto C', 'Produto D', 'Outros'],
        'Distribuição de Vendas'
    )
    elementos.append(pizza)
    elementos.append(Spacer(1, 30))

    # === CONCLUSÃO ===
    elementos.append(PageBreak())
    elementos.append(Paragraph("5. Conclusão", styles['Subtitulo']))
    elementos.append(Paragraph(
        "Este documento demonstra as principais capacidades de geração de PDF "
        "com Python. A biblioteca ReportLab oferece controle total sobre o layout "
        "e formatação dos documentos, permitindo criar relatórios profissionais "
        "de forma programática.",
        styles['TextoNormal']
    ))

    elementos.append(Spacer(1, 50))
    elementos.append(Paragraph("--- Fim do Documento ---", styles['Rodape']))

    # Gerar PDF
    doc.build(elementos)
    print(f"PDF criado: {caminho_saida}")
    return caminho_saida


# === FUNÇÕES AUXILIARES PARA USO COM LLMs ===

def novo_documento(caminho, tamanho=A4):
    """Cria novo documento PDF"""
    os.makedirs(os.path.dirname(caminho) if os.path.dirname(caminho) else '.', exist_ok=True)
    return SimpleDocTemplate(
        caminho,
        pagesize=tamanho,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )

def criar_paragrafo(texto, estilo='TextoNormal', styles=None):
    """Cria parágrafo formatado"""
    if styles is None:
        styles = criar_estilos()
    return Paragraph(texto, styles[estilo])

def criar_tabela(dados, larguras_colunas=None):
    """
    Cria tabela formatada

    Args:
        dados: lista de listas (primeira linha = cabeçalho)
        larguras_colunas: lista de larguras em cm
    """
    if larguras_colunas:
        larguras = [w*cm for w in larguras_colunas]
    else:
        larguras = None

    tabela = Table(dados, colWidths=larguras)
    tabela.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), AZUL_ESCURO),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, gray),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    return tabela

def criar_lista_bullets(itens, styles=None):
    """Cria lista com marcadores"""
    if styles is None:
        styles = criar_estilos()
    return ListFlowable(
        [ListItem(Paragraph(item, styles['TextoNormal'])) for item in itens],
        bulletType='bullet',
        leftIndent=20,
    )

def construir_pdf(doc, elementos):
    """Constrói o PDF final"""
    doc.build(elementos)
    print(f"PDF gerado com sucesso")


if __name__ == "__main__":
    saida = sys.argv[1] if len(sys.argv) > 1 else "out/documento_exemplo.pdf"
    criar_pdf(saida)
