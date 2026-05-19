/*Purpose: This script is responsible for importing location data from a JSON file into the database. 
It reads the data from the specified JSON file, processes it, and then uses Sequelize's bulkCreate method to insert the data into the Location table. 
The script also handles transactions to ensure data integrity and logs the results of the import process. If any errors occur during the import, they are caught and logged, and the process exits with an error code.*/

import fs from "fs/promises";
import "dotenv/config";
import { sequelize, Location } from "../config/db.config.js";

const dataPath = new URL("../data/locations.json", import.meta.url);

async function importLocations() {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const locations = JSON.parse(raw);

    if (!Array.isArray(locations)) {
      console.error("locations.json must contain an array");
      process.exit(1);
    }

    // Ensure numeric coords and sane defaults for required fields
    const normalized = locations.map((l) => ({
      id_utilizador: Number(l.id_utilizador) || null,
      latitude: l.latitude != null ? Number(l.latitude) : null,
      longitude: l.longitude != null ? Number(l.longitude) : null,
      cidade: l.cidade || l.city || "Unknown",
      pais: l.pais || l.country || "Portugal",
    }));

    // Remove any existing locations for these users to avoid duplicate entries
    const userIds = [
      ...new Set(normalized.map((r) => r.id_utilizador).filter(Boolean)),
    ];
    if (userIds.length > 0) {
      await Location.destroy({ where: { id_utilizador: userIds } });
    }

    // Bulk insert (validation enabled)
    await Location.bulkCreate(normalized, { validate: true });

    console.log(`Imported ${normalized.length} locations.`);
  } catch (err) {
    console.error("Failed to import locations:", err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

importLocations();
