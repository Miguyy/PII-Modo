"""
Module to produce sample user location records for the demo dataset.

Contains a curated mapping of Portuguese cities to their latitude/longitude
and a helper to create randomized user-location records referencing those
coordinates. Useful for populating maps or location-based features in the
frontend mock.
"""

from faker import Faker
import random

fake = Faker()  # Initialize Faker

country = "Portugal"

city_latitude_longitude = {
    "Lisboa": (38.7169, -9.1399),
    "Porto": (41.1496, -8.611),
    "Coimbra": (40.2056, -8.419),
    "Faro": (37.0194, -7.9304),
    "Braga": (41.5454, -8.4265),
    "Aveiro": (40.6405, -8.6538),
    "Viseu": (40.661, -7.909),
    "Évora": (38.571, -7.913),
    "Guimarães": (41.444, -8.296),
    "Vila Nova de Gaia": (41.1339, -8.611),
    "Vila do Conde": (41.351, -8.743),
    "Setúbal": (38.5244, -8.8882),
    "Santarém": (39.2333, -8.6833),
    "Leiria": (39.7436, -8.8070),
    "Portimão": (37.1367, -8.5370),
    "Ponta Delgada": (37.7412, -25.6756),
    "Funchal": (32.6669, -16.9241),
    "Olhão": (37.0179, -7.8436),
    "Viana do Castelo": (41.6934, -8.8292),
    "Matosinhos": (41.1880, -8.6895),
    "Amadora": (38.7596, -9.2345),
    "Seixal": (38.6456, -9.1077),
    "Almada": (38.6783, -9.1550),
    "Barcelos": (41.5381, -8.6151),
    "Tomar": (39.6000, -8.4094),
    "Sines": (37.9550, -8.8692),
    "Beja": (38.0151, -7.8636),
    "Castelo Branco": (39.8222, -7.4903),
    "Loulé": (37.1376, -8.0251),
    "Vila Real": (41.3000, -7.7442)
}

def generate_location_data():
    """Create a random user location record.

    Picks a random city from the predefined mapping and returns a mapping
    with `id_utilizador`, `pais`, `cidade`, `latitude` and `longitude`.

    Returns:
        dict: Location record for a demo user.
    """
    cidade = random.choice(list(city_latitude_longitude.keys()))
    latitude, longitude = city_latitude_longitude[cidade]
    id_utilizador = random.randint(1, 20)
    return {
        "id_utilizador": id_utilizador,
        "pais": country,
        "cidade": cidade,
        "latitude": latitude,
        "longitude": longitude
    }


locations = [generate_location_data() for _ in range(20)]  # Generate a list of 20 locations
for location in locations:
    print(location)


