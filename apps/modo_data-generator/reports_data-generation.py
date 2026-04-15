# Libraries
from faker import Faker
import random

fake = Faker() # Initialize Faker

def generate_report_data(): # Function to generate random report data
    id_utilizador = random.randint(1, 20)
    mes = random.randint(1, 12)
    semana = random.randint(1, 4)
    data_geracao = fake.date_time_between(start_date='-1y', end_date='now')
    points = random.randrange(0, 501, 5)
    conteudo = f"Report for user {id_utilizador}. Generated on {data_geracao.strftime('%Y-%m-%d %H:%M:%S')}. Tasks completed: {random.randint(0, 20)}, Habits maintained: {random.randint(0, 30)}, Points earned: {points}."
    caminho_relatorio = f"/reports/report_{id_utilizador}_{mes}_{semana}.pdf"
    return {
        "id_utilizador": id_utilizador,
        "mes": mes,
        "semana": semana,
        "data_geracao": data_geracao,
        "conteudo": conteudo,
        "caminho_relatorio": caminho_relatorio
    }
reports = [generate_report_data() for _ in range(20)] # Generate a list of 20 reports
for report in reports:
    print(report)

    