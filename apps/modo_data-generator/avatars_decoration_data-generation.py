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
import json
from pathlib import Path

fake = Faker()  # Initialize Faker

decorations_name = [
    "cat",
    "garden",
    "olives",
    "solarSystem",
    "summer",
    "zoo"
]

levels = {
        "solarSystem": 0,
        "garden": 5,
        "olives": 10,
        "cat": 15,
        "summer": 20,
        "zoo": 25,
    }

def decoration_data(name):
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
    #caminho_decoracao = f"/apps/modo_front-end/Modo/src/images/{name}.png"
    return {
        "id_utilizador": random.randint(1, 60),
        "id_decoracao": random.randint(1, 6),
        #"nome_decoracao": name,
        "decoracao_ativa": random.choice([True, False]),
        #"nivel_necessario": levels.get(name, 0),
        #"caminho_decoracao": caminho_decoracao
    }

#decorations = [decoration_data(name) for name in decorations_name]

# In range 20
decorations = [decoration_data(random.choice(decorations_name)) for _ in range(20)]  # Generate a list of 20 decorations

""" decorations = [decoration_data() for _ in range(6)]  # Generate a list of 6 decorations
for decoration in decorations:
    print(decoration)
 """

for decoration in decorations:
    print(decoration)

""" base = Path(__file__).resolve().parent.parent  
out = base / "modo_back-end" / "data" / "avatarDecorations.json"
out.parent.mkdir(parents=True, exist_ok=True)

with out.open("w", encoding="utf-8") as f:
    json.dump(decorations, f, default=str, ensure_ascii=False, indent=2)   """

base = Path(__file__).resolve().parent.parent  
out = base / "modo_back-end" / "data" / "usersAvatarDecorations.json"
out.parent.mkdir(parents=True, exist_ok=True)

with out.open("w", encoding="utf-8") as f:
    json.dump(decorations, f, default=str, ensure_ascii=False, indent=2)  