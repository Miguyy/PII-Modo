"""
Module to generate random environmental impact sample data for tasks.

This module simulates different impact types (water, energy, waste,
mobility, emissions) and provides helper functions to select units and
per-unit values. The generated mapping includes the task id, impact type,
value per unit and unit label. Quantities and totals are commented out as
they are typically calculated by the backend using these unit values.

Functions:
- impact_type(): randomly choose an impact category.
- value_per_unit(impact_type): return a plausible per-unit numeric value.
- unit(impact_type): return the unit string for the given impact type.
- generate_impact_data(): assemble a single impact record.
"""

from faker import Faker
import random

fake = Faker()  # Initialize Faker

def impact_type():
    """Randomly select an impact category.

    Returns one of: 'agua', 'energia', 'residuos', 'mobilidade', 'emissoes'.
    """
    types = ["agua", "energia", "residuos", "mobilidade", "emissoes"]
    return random.choice(types)


def value_per_unit(impact_type):
    """Return a plausible numeric value per unit for `impact_type`.

    The returned float is rounded to two decimals and represents a sample
    factor used to compute totals when multiplied by a quantity.

    Args:
        impact_type (str): One of the supported impact categories.

    Returns:
        float: Value per unit for the specified impact type.
    """
    if impact_type == "agua":
        return round(random.uniform(0.1, 0.5), 2)
    elif impact_type == "energia":
        return round(random.uniform(0.2, 0.7), 2)
    elif impact_type == "residuos":
        return round(random.uniform(0.05, 0.3), 2)
    elif impact_type == "mobilidade":
        return round(random.uniform(0.15, 0.6), 2)
    elif impact_type == "emissoes":
        return round(random.uniform(0.25, 0.8), 2)

def unit(impact_type):
    """Return the unit label for the given impact type.

    Args:
        impact_type (str): Impact category.

    Returns:
        str: Unit string (e.g. 'litros', 'kWh', 'kg', 'km', 'kg CO2e').
    """
    if impact_type == "agua":
        return "litros"
    elif impact_type == "energia":
        return "kWh"
    elif impact_type == "residuos":
        return "kg"
    elif impact_type == "mobilidade":
        return "km"
    elif impact_type == "emissoes":
        return "kg CO2e"

def generate_impact_data():
    """Assemble a single impact record for a (demo) task.

    The mapping includes `id_tarefa` (random demo task id), `tipo_impacto`,
    `valor_por_unidade` and `unidade`. Quantity and total impact are left
    commented out because in a real flow they are derived by the backend.

    Returns:
        dict: Impact record mapping.
    """
    tipo_impacto = impact_type()
    valor_por_unidade = value_per_unit(tipo_impacto)
    unidade = unit(tipo_impacto)

    # Calculated in the backend based on the value per unit and quantity
    # quantidade = random.randint(1, 100) # Random quantity between 1 and 100
    # impacto_total = round(valor_por_unidade * quantidade, 2)

    return {
        "id_tarefa": random.randint(1, 20),
        "tipo_impacto": tipo_impacto,
        "valor_por_unidade": valor_por_unidade,
        "unidade": unidade,
    }

impacts = [generate_impact_data() for _ in range(20)]  # Generate a list of 20 impacts
for impact in impacts:
    print(impact)