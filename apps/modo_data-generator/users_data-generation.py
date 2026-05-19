"""
Module to generate fake user records for the Modo demo dataset.

This module provides utilities to create realistic test users including
securely-generated passwords (printed in clear for demo), hashed passwords,
and simple metadata such as points, level, creation date, and user type.

Functions:
- generate_password(): produce a secure random password satisfying
  character-class requirements (lower, upper, digit, special).
- hash_password(password): return a SHA-256 hex digest of `password`.
- generate_user_data(): assemble a single user record dictionary.

Note: passwords are generated and printed for demo purposes
"""

from faker import Faker
import string
import random
import hashlib
import secrets
from datetime import datetime

fake = Faker()  # Initialize Faker

def generate_password():
    """Generate a secure random password.

    The returned password has length between 12 and 15 characters and is
    guaranteed to include at least one lowercase letter, one uppercase
    letter, one digit and one special character. The remaining characters
    are chosen from letters, digits and special characters and then the
    sequence is shuffled to remove predictable placement.

    Returns:
        str: The generated plaintext password.
    """
    length = secrets.choice([12, 13, 14, 15])
    specials = "!@#$%^&*()-_=+[]{};:,.<>/?"
    password = [
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.digits),
        secrets.choice(specials),
    ]
    all_chars = string.ascii_letters + string.digits + specials
    password += [secrets.choice(all_chars) for _ in range(length - 4)]
    for i in range(len(password) - 1, 0, -1):
        j = secrets.randbelow(i + 1)
        password[i], password[j] = password[j], password[i]
    print(password)
    return ''.join(password)

def hash_password(password):
    """Hash a plaintext password using SHA-256.

    This produces a deterministic hex digest suitable for storing in test
    datasets. For production use prefer a slow adaptive hash (bcrypt/scrypt/argon2).

    Args:
        password (str): Plaintext password to hash.

    Returns:
        str: Hexadecimal SHA-256 digest of the password.
    """
    return hashlib.sha256(password.encode()).hexdigest()

def generate_user_data():
    """Generate a single fake user record.

    The function uses Faker to produce a realistic name and constructs an
    email address in the form `name.surname@example.pt`. A secure password
    is generated, hashed and stored in the returned record. Additional
    fields include `pontos` (points), `nivel` (level derived from points),
    `data_criacao` (creation datetime) and `tipo_utilizador` (user type,
    either 'admin' with ~10% probability or 'cliente').

    Returns:
        dict: A mapping with keys: nome, email, password (hashed), pontos,
              nivel, data_criacao, tipo_utilizador.
    """
    nome = fake.name()
    email = nome.lower().replace(" ", ".") + "@example.pt"
    password = generate_password()
    hashed_password = hash_password(password)
    pontos = random.randrange(0, 501, 5)
    nivel = pontos // 100
    data_criacao = fake.date_time_between(start_date='-1y', end_date='now')
    tipo_utilizador = "admin" if random.random() < 0.1 else "cliente"

    return {
        "nome": nome,
        "email": email,
        "password": hashed_password,
        "pontos": pontos,
        "nivel": nivel,
        "data_criacao": data_criacao,
        "tipo_utilizador": tipo_utilizador
    }

users = [generate_user_data() for _ in range(20)]  # Generate a list of 20 users
for user in users:
    print(user)
