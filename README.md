# <img src="./apps/modo_front-end/Modo/src/images/modoIcon.png" alt="Modo Icon" width="130" height="30"/> - Modo, sustainable habit tracker

Modo is a lightweight habit-tracking project with three main parts: a Vue + Vite front-end, a Node/Sequelize back-end, and a Python data generator that uses Faker + SQLAlchemy to populate MySQL, for MySQL Workbench.

## What this repo contains

- `apps/modo_front-end/Modo` — Vue 3 front-end (Vite, Pinia, Vitest).
- `apps/modo_back-end/` — back-end using Node/Express and Sequelize and Postman for testing API endpoints.
- `apps/modo_data-generator/` — Python data generator scripts (Faker) and helpers that can use SQLAlchemy to write to MySQL for populating Workbench.
- `database/` — DB schema and image assets used by the project.

## Quick demo

- Run the data generator to populate a local MySQL instance (or seed the mock DB).
- Start the back-end (Sequelize-based) and then start the front-end dev server.
- Register a user, create habits, add avatar decorations, and view habit charts.

## Tech used

- Front-end: Vue 3, Vite, Pinia, Bootstrap, Font Awesome, Chart.js
- Back-end: Node.js, Express, Sequelize (MySQL)
- Data generator: Python, Faker, SQLAlchemy (writes to MySQL)
- Testing: Vitest for front-end unit tests

## Getting started

Prerequisites

- Node.js 16+ and npm (or yarn)
- Python 3.8+ and a virtual environment tool
- MySQL server (for the real DB), or use the included `db.json` for simple local testing

Front-end

1. Open `apps/modo_front-end/Modo` and install dependencies:

```bash
cd apps/modo_front-end/Modo
npm install
npm run dev
```

2. Open `http://localhost:5173` in your browser.

Back-end, you can use Postman to test the API endpoints or connect the front-end to it.

1. Open `apps/modo_back-end` and install dependencies and start the server:

```bash
cd apps/modo_back-end
npm install
node 'file'.js # replace 'file' with the main server file, e.g., index.js or app.js
# or use nodemon for auto-restart on changes:
npm install nodemon
nodemon 'file'.js
```

2. Ensure the back-end `config` points to your MySQL instance if using a real DB.

Data generator

1. Using Python and install requirements (Faker, SQLAlchemy, connector):

```bash
cd apps/modo_data-generator
pip install faker sqlalchemy mysql-connector-python
```

2. Run the generator scripts, for example:

```bash
python users_data-generation.py
python avatars_decoration_data-generation.py
```

Notes

- The `apps/modo_data-generator` scripts are intended to generate seed data using Faker; they can either write into a `db.json` mock file or connect to MySQL via SQLAlchemy depending on environment configuration.
- The front-end uses the `@` import alias. Vite is already configured with the alias in `apps/modo_front-end/Modo/vite.config.js`.
- The `apps/modo_front-end/Modo/jsconfig.json` helps the editor resolve `@/*` imports; if you see unresolved import errors in VS Code, ensure the editor workspace root includes the `Modo` folder or add a top-level config.

## Running tests

- Front-end unit tests: from `apps/modo_front-end/Modo` run:

```bash
npm run test:unit
```

## Project structure

- `apps/modo_front-end/Modo/src` — Vue app source
- `apps/modo_back-end` — Node.js + Sequelize server
- `apps/modo_data-generator` — Python Faker generators
- `database/schema.sql` — SQL schema used by the project

## Contributors

| Name            | GitHub profile                |
| --------------- | ----------------------------- |
| Miguel Machado  | https://github.com/Miguyy     |
| Manuel Teixeira | https://github.com/Manutex78  |
| Linda Silva     | https://github.com/LindaGlahy |

## License

MIT — see LICENSE file for details.
