/*
  Purpose: This script is responsible for importing notification data from a JSON file into the database. 
  It reads the data from the specified JSON file, processes it, and then uses Sequelize's bulkCreate method to insert the data into the Notification table in chunks. 
  The script also handles transactions to ensure data integrity and logs the results of the import process. 
  If any errors occur during the import, they are caught and logged, and the process exits with an error code.
*/

import fs from "fs/promises";
import "dotenv/config";
import { sequelize, Notification } from "../config/db.config.js";

const dataPath = new URL("../data/notifications.json", import.meta.url);

async function importNotifications() {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const notifications = JSON.parse(raw);
    const payload = notifications.map((n) => ({
      id_utilizador: n.id_utilizador,
      tipo_notificacao: n.tipo_notificacao,
      mensagem: n.mensagem,
      data: n.data,
      lida: n.lida,
    }));
    const chunkSize = 500;
    const transaction = await sequelize.transaction();
    try {
      for (let i = 0; i < payload.length; i += chunkSize) {
        const chunk = payload.slice(i, i + chunkSize);
        await Notification.bulkCreate(chunk, {
          transaction,
          validate: false,
          ignoreDuplicates: true,
        });
      }
      await transaction.commit();
      console.log(`Imported ${payload.length} notifications successfully.`);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error("Import failed:", err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

importNotifications();
