# Libraries
from faker import Faker
import random

fake = Faker() # Initialize Faker

habits = [
    ('Take care of houseplants or the garden regularly.', 'Gardening / Watering'),
    ('Sort household waste into the respective recycling bins.', 'Recycling'),
    ('Walk your daily commute to reduce your carbon footprint.', 'Sustainable Mobility'),
    ('Turn off the lights when leaving a room.', 'Energy'),
    ( 'Record daily water consumption to increase awareness.', 'Water'),
    ('Reduce shower time to save fresh water and energy.', 'Water'),
    ('Take cloth bags when going shopping.', 'Waste'),
    ( 'Unplug devices that are on standby from the outlet.', 'Energy'),
    ('Eat exclusively vegetarian meals once a week.', 'Food'),
    ('Pick up trash found during a walk.', 'Community'),
    ( 'Request invoices via email instead of paper.', 'Waste'),
    ('Place organic waste in the composter.', 'Waste'),
    ('Use a bicycle instead of a car for short distances.', 'Sustainable Mobility'),
    ( 'Buy fresh produce at the local market.', 'Food'),
    ('Collect the initial cold water from the shower with a bucket.', 'Water'),
    ('Use a reusable water bottle daily.', 'Waste'),
    ('Sort old clothes for donation.', 'Community'),
    ('Avoid the elevator to save electricity and get exercise.', 'Energy'),
    ( 'Consume the previous day\'s leftovers to avoid waste.', 'Food'),
    ( 'Replace old light bulbs with LED technology.', 'Energy'),
    ('Travel by bus or subway.', 'Sustainable Mobility'),
    ( 'Dry clothes on a drying rack instead of using a machine.', 'Energy'),
    ( 'Turn off the faucet while brushing your teeth.', 'Water'),
    ('Buy in bulk using your own jars.', 'Waste'),
    ('Participate in a reforestation initiative.', 'Community'),
]

def generate_habit_data(): # Function to generate random habit data
    description, category = random.choice(habits)
    return {
        "habit_name": category,
        "description": description,
        "category": category
    }

habits_data = [generate_habit_data() for _ in range(20)] # Generate a list of 20 habits
for habit in habits_data:
    print(habit)

