"""
Module to generate demo task templates and per-user task assignments.

This script defines a catalogue of HABITS and provides utilities to create
task templates (`tarefas`) and randomized user-task assignments
(`tarefas_utilizador`). The generated output is printed to stdout which is
convenient for seeding local JSON/DB fixtures for frontend development.

Main functions:
- _pick_points_and_priority(): choose points and map to priority label.
- generate_tasks(num_tasks, num_users): build lists of tasks and user-task
  relationships.
- generate_tasks_data(): example runner that prints generated data.
"""

from faker import Faker
import random
from datetime import datetime

fake = Faker()

HABITS = [
    (1, 'Water plants', 'Take care of houseplants or the garden regularly.', 'Gardening / Watering'),
    (2, 'Spend 5 minutes recycling', 'Sort household waste into the respective recycling bins.', 'Recycling'),
    (3, 'Walk to work/school', 'Walk your daily commute to reduce your carbon footprint.', 'Sustainable Mobility'),
    (4, 'Turn off unnecessary lights', 'Turn off the lights when leaving a room.', 'Energy'),
    (5, 'Track daily water usage', 'Record daily water consumption to increase awareness.', 'Water'),
    (6, 'Limit shower to 5 minutes', 'Reduce shower time to save fresh water and energy.', 'Water'),
    (7, 'Use reusable shopping bags', 'Take cloth bags when going shopping.', 'Waste'),
    (8, 'Unplug unused electronics', 'Unplug devices that are on standby from the outlet.', 'Energy'),
    (9, 'Meatless Monday', 'Eat exclusively vegetarian meals once a week.', 'Food'),
    (10, 'Pick up local litter', 'Pick up trash found during a walk.', 'Community'),
    (11, 'Opt for digital invoices', 'Request invoices via email instead of paper.', 'Waste'),
    (12, 'Home composting', 'Place organic waste in the composter.', 'Waste'),
    (13, 'Cycle for short trips', 'Use a bicycle instead of a car for short distances.', 'Sustainable Mobility'),
    (14, 'Buy from local farmers', 'Buy fresh produce at the local market.', 'Food'),
    (15, 'Save shower warm-up water', 'Collect the initial cold water from the shower with a bucket.', 'Water'),
    (16, 'Carry a reusable bottle', 'Use a reusable water bottle daily.', 'Waste'),
    (17, 'Donate unused clothes', 'Sort old clothes for donation.', 'Community'),
    (18, 'Take the stairs', 'Avoid the elevator to save electricity and get exercise.', 'Energy'),
    (19, 'Eat leftovers', "Consume the previous day's leftovers to avoid waste.", 'Food'),
    (20, 'Switch to LED bulbs', 'Replace old light bulbs with LED technology.', 'Energy'),
    (21, 'Use public transport', 'Travel by bus or subway.', 'Sustainable Mobility'),
    (22, 'Air-dry laundry', 'Dry clothes on a drying rack instead of using a machine.', 'Energy'),
    (23, 'Turn off tap while brushing', 'Turn off the faucet while brushing your teeth.', 'Water'),
    (24, 'Buy bulk groceries', 'Buy in bulk using your own jars.', 'Waste'),
    (25, 'Plant a tree', 'Participate in a reforestation initiative.', 'Community'),
]

def _pick_points_and_priority():
    """Pick a points value and return the corresponding priority label.

    The helper selects from the set {5,10,15} and maps these to 'low',
    'medium' and 'high' priority strings respectively.

    Returns:
        tuple: (points:int, priority:str)
    """
    points = random.choice([5, 10, 15])
    priority = 'low' if points == 5 else 'medium' if points == 10 else 'high'
    return points, priority

def generate_tasks(num_tasks=20, num_users=10):
    """Generate task templates and randomized per-user task assignments.

    Args:
        num_tasks (int): Number of task templates to create.
        num_users (int): Number of users to randomly assign tasks to.

    Returns:
        tuple: (tarefas, tarefas_utilizador)
            - tarefas: list of task template mappings
            - tarefas_utilizador: list of user-task relationship mappings
    """
    tarefas = []
    tarefas_utilizador = []

    for tid in range(1, num_tasks + 1):
        id_habito = random.randint(1, len(HABITS))

        habit_tuple = next((h for h in HABITS if h[0] == id_habito), None)
        habit_original_name = habit_tuple[1] if habit_tuple else 'Habit'
        habit_category = habit_tuple[3] if habit_tuple and len(habit_tuple) > 3 else 'Uncategorized'

        pontos_tarefa, prioridade = _pick_points_and_priority()
        tipo_tarefa = random.choice(['check', 'count', 'timer'])
        localizacao_tarefa = random.choice(['inside', 'outside'])

        duracao_temporizador = None
        quantidade_necessaria = None
        if tipo_tarefa == 'timer':
            duracao_temporizador = random.choice([30, 60, 120, 300, 600])
        elif tipo_tarefa == 'count':
            quantidade_necessaria = random.choice([1, 5, 10, 20, 50, 100])

        tarefa = {
            'id_tarefa': tid,
            'id_habito': id_habito,
            'habit_name': habit_category,
            'nome_tarefa': habit_original_name,
            'pontos_tarefa': pontos_tarefa,
            'tipo_tarefa': tipo_tarefa,
            'localizacao_tarefa': localizacao_tarefa,
            'prioridade_tarefa': prioridade,
            'duracao_temporizador': duracao_temporizador,
            'quantidade_necessaria': quantidade_necessaria,
        }
        tarefas.append(tarefa)

        id_utilizador = random.randint(1, num_users)
        tarefa_ativa = random.choice([0, 1])
        estado_tarefa = 'completed' if tarefa_ativa == 1 and random.random() < 0.6 else 'pending'

        progresso = None
        if tipo_tarefa == 'count' and quantidade_necessaria is not None:
            current = random.randint(0, quantidade_necessaria)
            progresso = f"{current}/{quantidade_necessaria}"

        data_inicio = fake.date_time_between(start_date='-30d', end_date='now')
        data_fim = None
        if estado_tarefa == 'completed':
            data_fim = fake.date_time_between(start_date=data_inicio, end_date='+30d')

        tarefas_utilizador.append({
            'id_tarefa': tid,
            'id_utilizador': id_utilizador,
            'tarefa_ativa': tarefa_ativa,
            'estado_tarefa': estado_tarefa,
            'progresso': progresso,
            'data_inicio': data_inicio.isoformat(sep=' '),
            'data_fim': data_fim.isoformat(sep=' ') if data_fim else None,
        })

    return tarefas, tarefas_utilizador

def generate_tasks_data():
    """Runner that generates tasks and prints them to stdout.

    This convenience function calls `generate_tasks` with default values
    (20 tasks, 12 users) and prints the two resulting lists. It is useful
    for quickly creating fixture output when developing locally.
    """
    tarefas, tarefas_utilizador = generate_tasks(num_tasks=20, num_users=12)
    print("TAREFAS:")
    for t in tarefas:
        print(t)
    print("\nTAREFAS_UTILIZADOR:")
    for tu in tarefas_utilizador:
        print(tu)


generate_tasks_data()