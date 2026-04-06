# Libraries
from faker import Faker
import random
import hashlib
from datetime import datetime

fake = Faker() # Initialize Faker

def hash_password(password): # Simple hashing function for demonstration purposes
    return hashlib.sha256(password.encode()).hexdigest()[:random.randint(12, 15)]

def generate_user_data(): # Function to generate random user data
    nome = fake.name()
    email = fake.email()
    password = "Password123!"
    hashed_password = hash_password(password)
    pontos = random.randint(0, 1000)
    nivel = pontos // 100
    data_criacao = fake.date_time_between(start_date='-1y', end_date='now')
    tipo_utilizador = "admin" if random.random() < 0.1 else "cliente" # 10% chance to be an admin, 90% chance to be a cliente

    return {
        "nome": nome,
        "email": email,
        "password": hashed_password,
        "pontos": pontos,
        "nivel": nivel,
        "data_criacao": data_criacao,
        "tipo_utilizador": tipo_utilizador
    }

users = [generate_user_data() for _ in range(20)] # Generate a list of 100 users
for user in users:
    print(user)