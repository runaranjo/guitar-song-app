import pg from "pg"

const db = new pg.Client({
    user: "runaranjo",
    host: "localhost",
    database: "songify_db",
    password: "123456",
    port: 5432
  })
  
  export default db