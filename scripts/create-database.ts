import { Client } from "pg";

async function main() {
  const client = new Client({
    connectionString: "postgresql://eleweke@localhost:5432/postgres",
  });

  await client.connect();

  const databaseName = "open_volunteer_platform";

  const result = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [databaseName]
  );

  if (result.rowCount === 0) {
    await client.query(`CREATE DATABASE ${databaseName}`);
    console.log(`Created database: ${databaseName}`);
  } else {
    console.log(`Database already exists: ${databaseName}`);
  }

  await client.end();
}

main().catch((error) => {
  console.error("Failed to create database:", error);
  process.exit(1);
});