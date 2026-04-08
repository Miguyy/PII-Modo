# Libraries
from faker import Faker
import string
import random
import hashlib
from datetime import datetime

fake = Faker() # Initialize Faker

def generate_password():
    length = random.randint(12, 15)

    lower = random.choice(string.ascii_lowercase)
    upper = random.choice(string.ascii_uppercase)
    digit = random.choice(string.digits)
    special = random.choice("!@#$%^&*()_+-=")

    others = ''.join(random.choices(
        string.ascii_letters + string.digits + "!@#$%^&*()_+-=",
        k=length - 4
    ))

    password = lower + upper + digit + special + others
    print(password) # Just to see the generated password before hashing

    return ''.join(random.sample(password, len(password)))

def hash_password(password): # Simple hashing function for demonstration purposes
    return hashlib.sha256(password.encode()).hexdigest()

def generate_user_data(): # Function to generate random user data
    nome = fake.name()
    email = nome.lower().replace(" ", ".") + "@example.pt" 
    password = generate_password()
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

users = [generate_user_data() for _ in range(20)] # Generate a list of 20 users
for user in users:
    print(user)
