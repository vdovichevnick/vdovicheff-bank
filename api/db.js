import pg from "pg";

const pool = new pg.Pool({
  user: "nikitavdovichev",
  password: "QMlhVQRyhYFRy5akvb7gJNgoUoxpUG3V",
  host: "dpg-cov3sc2cn0vc739svlf0-a",
  port: "5432",
  database: "vdovicheff",
});

export default pool;
