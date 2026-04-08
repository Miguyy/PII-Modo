# Libraries
from faker import Faker
import random
from datetime import datetime

fake = Faker() # Initialize Faker

def notification_type(): # Function to randomly select a notification type
    return random.choice(["nivel", "avatar", "admin", "sistema"])

actions = ["created", "updated", "deleted"]
entities = ["task", "habit", "avatar", "user"]

def generate_admin_message():
    action = random.choice(actions)
    entity = random.choice(entities)
    return f"Admin notification: A {entity} has been {action}. Please review the changes in the admin panel for more details."

def generate_message(tipo):
    if tipo == "nivel":
        nivel = random.randint(1, 10)
        return f"Congratulations! You've reached a new level {nivel}. Keep up the good work to unlock more rewards."
    elif tipo == "avatar":
        return "New avatar unlocked! Check out your new look in the avatar section and show it off to your friends."
    elif tipo == "admin":
        return generate_admin_message()
    elif tipo == "sistema":
        return "System update: We have made some improvements to enhance your experience. Please check the latest features in the app and enjoy the new functionalities."

def generate_notification_data(): # Function to generate random notification data
    tipo = notification_type()
    mensagem = generate_message(tipo)
    id_utilizador = random.randint(1, 20) 
    data = fake.date_time_between(start_date='-1y', end_date='now')
    lida = random.choice([True, False]) # Randomly mark the notification as read or unread

    return {
        "id_utilizador": id_utilizador,
        "tipo_notificacao": tipo,
        "mensagem": mensagem,
        "data": data,
        "lida": lida
    }

notifications = [generate_notification_data() for _ in range(20)] # Generate a list of 20 notifications
for notification in notifications:
    print(notification)