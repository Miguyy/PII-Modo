"""
Module that provides a small catalogue of environmentally-friendly
habits and utilities to generate random habit records for demo data.

Functions:
- generate_habit_data(): pick a random habit and return a mapping with
  name, descricao_habito and categoria suitable for inserting into test data.
"""

from faker import Faker
import random
import json
from pathlib import Path

fake = Faker()  # Initialize Faker

habits = [
    ('Take care of houseplants or the garden regularly.', 'Gardening / Watering'),
    ('Sort household waste into the respective recycling bins.', 'Recycling'),
    ('Walk your daily commute to reduce your carbon footprint.', 'Sustainable Mobility'),
    ('Turn off the lights when leaving a room.', 'Energy'),
    ('Record daily water consumption to increase awareness.', 'Water'),
    ('Reduce shower time to save fresh water and energy.', 'Water'),
    ('Take cloth bags when going shopping.', 'Waste'),
    ('Unplug devices that are on standby from the outlet.', 'Energy'),
    ('Eat exclusively vegetarian meals once a week.', 'Food'),
    ('Pick up trash found during a walk.', 'Community'),
    ('Request invoices via email instead of paper.', 'Waste'),
    ('Place organic waste in the composter.', 'Waste'),
    ('Use a bicycle instead of a car for short distances.', 'Sustainable Mobility'),
    ('Buy fresh produce at the local market.', 'Food'),
    ('Collect the initial cold water from the shower with a bucket.', 'Water'),
    ('Use a reusable water bottle daily.', 'Waste'),
    ('Sort old clothes for donation.', 'Community'),
    ('Avoid the elevator to save electricity and get exercise.', 'Energy'),
    ("Consume the previous day's leftovers to avoid waste.", 'Food'),
    ("Replace old light bulbs with LED technology.", 'Energy'),
    ('Travel by bus or subway.', 'Sustainable Mobility'),
    ('Dry clothes on a drying rack instead of using a machine.', 'Energy'),
    ('Turn off the faucet while brushing your teeth.', 'Water'),
    ('Buy in bulk using your own jars.', 'Waste'),
    ('Participate in a reforestation initiative.', 'Community'),
    ('Use a reusable coffee cup or bottle instead of disposables.', 'Waste'),
    ('Carpool or use a campus shuttle instead of driving alone.', 'Sustainable Mobility'),
    ('Buy second-hand or campus-swapped clothes instead of new.', 'Waste'),
    ('Report and fix water leaks / use campus refill stations.', 'Water'),
    ('Support the campus farmers market or local food suppliers.', 'Food'),
]

def generate_habit_data():
    """Select a random habit and return a structured habit record.

    The returned dictionary contains `nome_habito` (categoria), `descricao_habito`
    and `categoria`, suitable for importing into demo datasets or
    displaying in UI mockups.

    Returns:
        dict: A habit record with keys `nome_habito`, `descricao_habito`, `categoria`.
    """
    descricao_habito, categoria = random.choice(habits)
    return {
        "nome_habito": categoria,
        "descricao_habito": descricao_habito,
        "categoria": categoria
    }

habits = [generate_habit_data() for _ in range(30)]  # Generate a list of 30 habits
for habit in habits:
    print(habit)

base = Path(__file__).resolve().parent.parent  
out = base / "modo_back-end" / "data" / "habits.json"
out.parent.mkdir(parents=True, exist_ok=True)

with out.open("w", encoding="utf-8") as f:
    json.dump(habits, f, default=str, ensure_ascii=False, indent=2)

