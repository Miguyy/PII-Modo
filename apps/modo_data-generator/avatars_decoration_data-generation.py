"""
Module to generate fake avatar decoration records for the Modo demo dataset.

This module produces sample avatar decoration entries indicating which
decorations a user owns, whether they are active and the required level to
unlock them.

Functions:
- decoration_data(): create a single decoration record with randomized
  name, activity flag and required level.
"""

from faker import Faker
import random

fake = Faker()  # Initialize Faker

decorations_name = [
    "cat",
    "garden",
    "olives",
    "solarSystem",
    "summer",
    "zoo"
]

def decoration_data():
    """Generate a single avatar decoration record.

    The returned mapping contains:
    - id_utilizador: an integer user id (randomized for demo)
    - nome_decoracao: name of the decoration chosen from a small set
    - decoracao_ativa: boolean indicating whether the decoration is active
    - nivel_necessario: integer level required to unlock the decoration
    - caminho_decoracao: a sample file path to the decoration image asset

    Returns:
        dict: Decoration record for insertion into test datasets.
    """
    nome_decoracao = random.choice(list(decorations_name))
    decoracao_ativa = random.choice([True, False])
    nivel_necessario = random.choice([5, 10, 15, 20, 25, 30, 35, 40, 45, 50])
    caminho_decoracao = f"/apps/modo_front-end/Modo/src/images/{nome_decoracao}.png"

    return {
        "id_utilizador": random.randint(1, 20),
        "nome_decoracao": nome_decoracao,
        "decoracao_ativa": decoracao_ativa,
        "nivel_necessario": nivel_necessario,
        "caminho_decoracao": caminho_decoracao
    }

decorations = [decoration_data() for _ in range(20)]  # Generate a list of 20 decorations
for decoration in decorations:
    print(decoration)

