# Libraries
from faker import Faker
import random

fake = Faker() # Initialize Faker

def impact_type(): # Function to randomly select an impact type
    types = ["agua", "energia", "residuos", "mobilidade"]
    return random.choice(types)

def value_per_unit(impact_type): # Function to determine value per unit based on impact type
    if impact_type == "agua":
        return round(random.uniform(0.1, 0.5), 2) # Value between 0.1 and 0.5
    elif impact_type == "energia":
        return round(random.uniform(0.2, 0.7), 2) # Value between 0.2 and 0.7
    elif impact_type == "residuos":
        return round(random.uniform(0.05, 0.3), 2) # Value between 0.05 and 0.3
    elif impact_type == "mobilidade":
        return round(random.uniform(0.15, 0.6), 2) # Value between 0.15 and 0.6
    
def unit(impact_type): # Function to determine unit based on impact type
    if impact_type == "agua":
        return "litros"
    elif impact_type == "energia":
        return "kWh"
    elif impact_type == "residuos":
        return "kg"
    elif impact_type == "mobilidade":
        return "km"
    
def generate_impact_data(): # Function to generate random impact data   
    tipo_impacto = impact_type()
    valor_por_unidade = value_per_unit(tipo_impacto)
    unidade = unit(tipo_impacto)
    # quantidade = random.randint(1, 100) # Random quantity between 1 and 100
     # impacto_total = round(valor_por_unidade * quantidade, 2) # Total impact calculated as value per unit * quantity

    return {
        "tipo_impacto": tipo_impacto,
        "valor_por_unidade": valor_por_unidade,
        "unidade": unidade,
        # "quantidade": quantidade,
        # "impacto_total": impacto_total
    }

impacts = [generate_impact_data() for _ in range(20)] # Generate a list of 100 impacts
for impact in impacts:
    print(impact)