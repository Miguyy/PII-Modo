# Libraries
from faker import Faker
import random

fake = Faker() # Initialize Faker

decorations_name = [
    "cat",
    "garden",
    "olives",
    "solarSystem",
    "summer",
    "zoo"
]

def decoration_data(): # Function to generate random decoration data
    nome_decoracao = random.choice(list(decorations_name))
    decoracao_ativa = random.choice([True, False]) # Randomly mark the decoration as active or inactive
    nivel_necessario = random.choice([5, 10, 15, 20, 25, 30, 35, 40, 45, 50]) 

    return {
        "id_utilizador": random.randint(1, 20),
        "nome_decoracao": nome_decoracao,
        "decoracao_ativa": decoracao_ativa,
        "nivel_necessario": nivel_necessario
    }

decorations = [decoration_data() for _ in range(20)] # Generate a list of 20 decorations
for decoration in decorations:
    print(decoration)

