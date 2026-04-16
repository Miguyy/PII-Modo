"""
Module to produce sample monthly/weekly report records for demo users.

Each generated report contains an owner id, the month and week it
pertains to, a generation timestamp, a human-readable content summary and
a sample file path where a PDF report would be stored.
"""

from faker import Faker
import random

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
    id_utilizador = random.randint(1, 20)
    mes = random.randint(1, 12)
    semana = random.randint(1, 4)
    data_geracao = fake.date_time_between(start_date='-1y', end_date='now')
    pontos = random.randrange(0, 501, 5)
    conteudo = f"Report for user {id_utilizador}. Generated on {data_geracao.strftime('%Y-%m-%d %H:%M:%S')}. Tasks completed: {random.randint(0, 20)}, Habits maintained: {random.randint(0, 30)}, points earned: {pontos}."
    caminho_relatorio = f"/reports/report_{id_utilizador}_{mes}_{semana}.pdf"
    return {
        "id_utilizador": id_utilizador,
        "mes": mes,
        "semana": semana,
        "data_geracao": data_geracao,
        "conteudo": conteudo,
        "caminho_relatorio": caminho_relatorio
    }

reports = [generate_report_data() for _ in range(20)]  # Generate a list of 20 reports
for report in reports:
    print(report)

    