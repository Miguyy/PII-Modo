# Libraries
from faker import Faker
import random
from datetime import datetime

fake = Faker() # Initialize Faker

def notification_type(): # Function to randomly select a notification type
    types = ["nivel", "avatar", "admin", "sistema"]
    return random.choice(types)

def generate_notification_data(): # Function to generate random notification data
    tipo_notificacao = notification_type()
    mensagem = f"Notification of type {tipo_notificacao}"
    data = fake.date_time_between(start_date='-1y', end_date='now')
    lida = random.choice([True, False]) # Randomly mark the notification as read or unread

    return {
        "tipo_notificacao": tipo_notificacao,
        "mensagem": mensagem,
        "data": data,
        "lida": lida
    }

notifications = [generate_notification_data() for _ in range(20)] # Generate a list of 100 notifications
for notification in notifications:
    print(notification)