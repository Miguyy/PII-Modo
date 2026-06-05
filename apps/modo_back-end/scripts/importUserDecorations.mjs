/*
  Purpose: This script is responsible for importing user decoration data from a JSON file into the database. 
  It reads the data from the specified JSON file, processes it, and then uses Sequelize's bulkCreate method to insert the data into the UserDecorations table in chunks. 
  The script also handles transactions to ensure data integrity and logs the results of the import process. If any errors occur during the import, they are caught and logged, and the process exits with an error code.
*/

import fs from "fs/promises";
import "dotenv/config";
import { sequelize, UserDecorations } from "../config/db.config.js";

const dataPath = new URL(
  "../data/usersAvatarDecorations.json",
  import.meta.url,
);

async function importUserDecorations() {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const decorations = JSON.parse(raw);
    const payload = decorations.map((d) => ({
      id_utilizador: d.id_utilizador,
      id_decoracao: d.id_decoracao,
      decoracao_ativa: d.decoracao_ativa,
    }));

    const chunkSize = 500;
    const transaction = await sequelize.transaction();
    try {
      for (let i = 0; i < payload.length; i += chunkSize) {
        const chunk = payload.slice(i, i + chunkSize);
        await UserDecorations.bulkCreate(chunk, {
          transaction,
          validate: false,
          ignoreDuplicates: true,
        });
      }
      await transaction.commit();
      console.log(`Imported ${payload.length} user decorations successfully.`);
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

importUserDecorations();
