"""
Module to create sample notification entries for demo users.

This module supports several notification types (level-up, avatar,
admin, system) and generates human-readable messages appropriate to each
type. Each generated record contains a user id, notification type, message,
timestamp and a read/unread flag.
"""

from faker import Faker
import random
from datetime import datetime

fake = Faker()  # Initialize Faker

actions = ["created", "updated", "deleted"]
entities = ["task", "habit", "avatar", "user"]

def notification_type():
    """Randomly choose a notification category.

    Returns one of: 'nivel', 'avatar', 'admin', 'sistema'.
    """
    return random.choice(["nivel", "avatar", "admin", "sistema"])


def generate_admin_message():
    """Create a short admin-style notification message.

    Used for 'admin' notification type to simulate administrative events
    such as created/updated/deleted entities.
    """
    action = random.choice(actions)
    entity = random.choice(entities)
    return f"Admin notification: A {entity} has been {action}. Please review the changes in the admin panel for more details."

def generate_message(tipo):
    """Generate a message string appropriate to the notification `tipo`.

    Args:
        tipo (str): Notification type.

    Returns:
        str: Human-readable notification message.
    """
    if tipo == "nivel":
        nivel = random.randint(1, 10)
        return f"Congratulations! You've reached a new level {nivel}. Keep up the good work to unlock more rewards."
    elif tipo == "avatar":
        return "New avatar unlocked! Check out your new look in the avatar section and show it off to your friends."
    elif tipo == "admin":
        return generate_admin_message()
    elif tipo == "sistema":
        return "System update: We have made some improvements to enhance your experience. Please check the latest features in the app and enjoy the new functionalities."

def generate_notification_data():
    """Assemble a single notification record.

    The returned mapping includes `id_utilizador`, `tipo_notificacao`,
    `mensagem`, `data` (a datetime) and `lida` (boolean read flag).

    Returns:
        dict: Notification record.
    """
    tipo = notification_type()
    mensagem = generate_message(tipo)
    id_utilizador = random.randint(1, 20)
    data = fake.date_time_between(start_date='-1y', end_date='now')
    lida = random.choice([True, False])

    return {
        "id_utilizador": id_utilizador,
        "tipo_notificacao": tipo,
        "mensagem": mensagem,
        "data": data,
        "lida": lida
    }

notifications = [generate_notification_data() for _ in range(20)]  # Generate a list of 20 notifications
for notification in notifications:
    print(notification)