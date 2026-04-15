# Libraries
from faker import Faker
import random

fake = Faker() # Initialize Faker

habits = [
    ('Water plants', 'Take care of houseplants or the garden regularly.', 'Gardening / Watering'),
    ('Spend 5 minutes recycling', 'Sort household waste into the respective recycling bins.', 'Recycling'),
    ('Walk to work/school', 'Walk your daily commute to reduce your carbon footprint.', 'Sustainable Mobility'),
    ('Turn off unnecessary lights', 'Turn off the lights when leaving a room.', 'Energy'),
    ('Track daily water usage', 'Record daily water consumption to increase awareness.', 'Water'),
    ('Limit shower to 5 minutes', 'Reduce shower time to save fresh water and energy.', 'Water'),
    ('Use reusable shopping bags', 'Take cloth bags when going shopping.', 'Waste'),
    ('Unplug unused electronics', 'Unplug devices that are on standby from the outlet.', 'Energy'),
    ('Meatless Monday', 'Eat exclusively vegetarian meals once a week.', 'Food'),
    ('Pick up local litter', 'Pick up trash found during a walk.', 'Community'),
    ('Opt for digital invoices', 'Request invoices via email instead of paper.', 'Waste'),
    ('Home composting', 'Place organic waste in the composter.', 'Waste'),
    ('Cycle for short trips', 'Use a bicycle instead of a car for short distances.', 'Sustainable Mobility'),
    ('Buy from local farmers', 'Buy fresh produce at the local market.', 'Food'),
    ('Save shower warm-up water', 'Collect the initial cold water from the shower with a bucket.', 'Water'),
    ('Carry a reusable bottle', 'Use a reusable water bottle daily.', 'Waste'),
    ('Donate unused clothes', 'Sort old clothes for donation.', 'Community'),
    ('Take the stairs', 'Avoid the elevator to save electricity and get exercise.', 'Energy'),
    ('Eat leftovers', 'Consume the previous day\'s leftovers to avoid waste.', 'Food'),
    ('Switch to LED bulbs', 'Replace old light bulbs with LED technology.', 'Energy'),
    ('Use public transport', 'Travel by bus or subway.', 'Sustainable Mobility'),
    ('Air-dry laundry', 'Dry clothes on a drying rack instead of using a machine.', 'Energy'),
    ('Turn off tap while brushing', 'Turn off the faucet while brushing your teeth.', 'Water'),
    ('Buy bulk groceries', 'Buy in bulk using your own jars.', 'Waste'),
    ('Plant a tree', 'Participate in a reforestation initiative.', 'Community'),
]

def generate_habit_data(): # Function to generate random habit data
    habit_name, description, category = random.choice(habits)
    return {
        "habit_name": habit_name,
        "description": description,
        "category": category
    }

habits_data = [generate_habit_data() for _ in range(20)] # Generate a list of 20 habits
for habit in habits_data:
    print(habit)

