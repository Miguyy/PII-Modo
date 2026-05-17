"""
Module to produce sample monthly/weekly report records for demo users.

Each generated report contains an owner id, the month and week it
pertains to, a generation timestamp, a human-readable content summary and
a sample file path where a PDF report would be stored.
"""

from faker import Faker
import random
import json
from pathlib import Path

fake = Faker()  # Initialize Faker

def generate_report_data():
    """Generate a single demo report record.

    The record includes:
    - id_utilizador: owner of the report
    - mes: month (1-12)
    - semana: week (1-4)
    - data_geracao: a datetime when the report was generated
    - conteudo: a short textual summary
    - caminho_relatorio: a sample filesystem path to the generated PDF

    Returns:
        dict: Report metadata mapping.
    """
    id_utilizador = random.randint(1, 60)
    mes = random.randint(1, 12)
    semana = random.randint(1, 4)
    data_geracao = fake.date_time_between(start_date='-1y', end_date='now')
    pontos = random.randrange(0, 501, 5)
    conteudo = f"Report for user {id_utilizador}. Generated on {data_geracao.strftime('%Y-%m-%d %H:%M:%S')}. Tasks completed: {random.randint(0, 30)}, points earned: {pontos}."
    caminho_relatorio = f"/apps/modo_front-end/Modo/src/reports/report_{id_utilizador}_m{mes}_w{semana}.pdf"
    return {
        "id_utilizador": id_utilizador,
        "mes": mes,
        "semana": semana,
        "data_geracao": data_geracao,
        "conteudo": conteudo,
        "caminho_relatorio": caminho_relatorio
    }

reports = [generate_report_data() for _ in range(30)]  # Generate a list of 30 reports
for report in reports:
    print(report)

base = Path(__file__).resolve().parent.parent  
out = base / "modo_back-end" / "data" / "reports.json"
out.parent.mkdir(parents=True, exist_ok=True)

with out.open("w", encoding="utf-8") as f:
    json.dump(reports, f, default=str, ensure_ascii=False, indent=2)
    