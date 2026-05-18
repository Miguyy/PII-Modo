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
import json
from pathlib import Path

fake = Faker()  # Initialize Faker

actions = ["created", "updated", "deleted"]
entities = ["task", "habit", "avatar", "user"]

def notification_type():
    """Randomly choose a notification category.

    Returns one of: 'level', 'avatar', 'admin', 'system'.
    """
    return random.choice(["level", "avatar", "admin", "system"])


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
    if tipo == "level":
        level = random.randint(1, 10)
        return f"Congratulations! You've reached a new level {level}. Keep up the good work to unlock more rewards."
    elif tipo == "avatar":
        return "New avatar unlocked! Check out your new look in the avatar section and show it off to your friends."
    elif tipo == "admin":
        return generate_admin_message()
    elif tipo == "system":
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
    id_utilizador = random.randint(1, 60)
    data = fake.date_time_between(start_date='-1y', end_date='now')
    lida = random.choice([True, False])

    return {
        "id_utilizador": id_utilizador,
        "tipo_notificacao": tipo,
        "mensagem": mensagem,
        "data": data,
        "lida": lida
    }

notifications = [generate_notification_data() for _ in range(30)]  # Generate a list of 30 notifications
for notification in notifications:
    print(notification)

base = Path(__file__).resolve().parent.parent  
out = base / "modo_back-end" / "data" / "notifications.json"
out.parent.mkdir(parents=True, exist_ok=True)

with out.open("w", encoding="utf-8") as f:
    json.dump(notifications, f, default=str, ensure_ascii=False, indent=2)