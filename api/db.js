import pg from "pg";

const pool = new pg.Pool({
  user: "nikitavdovichev",
  password: "12345678",
  host: "localhost",
  port: "5432",
  database: "auth",
});

export default pool;
