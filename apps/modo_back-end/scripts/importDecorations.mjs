/*Purpose: This script is responsible for importing avatar decoration data from a JSON file into the database. 
It reads the data from the specified JSON file, processes it, and then uses Sequelize's bulkCreate method to insert the data into the AvatarDecoration table in chunks. 
The script also handles transactions to ensure data integrity and logs the results of the import process. 
If any errors occur during the import, they are caught and logged, and the process exits with an error code.*/

import fs from "fs/promises";
import "dotenv/config";
import { sequelize, AvatarDecoration } from "../config/db.config.js";

const dataPath = new URL("../data/avatarDecorations.json", import.meta.url);

async function importDecorations() {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const decorations = JSON.parse(raw);

    const payload = decorations.map((d) => ({
      nome_decoracao: d.nome_decoracao,
      nivel_necessario: d.nivel_necessario,
      caminho_decoracao: d.caminho_decoracao,
    }));

    const chunkSize = 500;
    const transaction = await sequelize.transaction();
    try {
      for (let i = 0; i < payload.length; i += chunkSize) {
        const chunk = payload.slice(i, i + chunkSize);
        await AvatarDecoration.bulkCreate(chunk, {
          transaction,
          validate: false,
          ignoreDuplicates: true,
        });
      }
      await transaction.commit();
      console.log(
        `Imported ${payload.length} avatar decorations successfully.`,
      );
    } catch (err) {
      await transaction.rollback();
      throw err;
    } finally {
      await sequelize.close();
    }
  } catch (err) {
    console.error("Import failed:", err);
    process.exit(1);
  }
}

importDecorations();
