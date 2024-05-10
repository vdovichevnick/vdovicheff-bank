import pool from "../db.js";
import { getSavedUserData } from "../saveUser.js";

class UserRepository {
  static async createUser({ userName, hashedPassword, role }) {
    const response = await pool.query(
        "INSERT INTO users (name, password, role) VALUES ($1, $2, $3) RETURNING *",
        [userName, hashedPassword, role],
    );

    return response.rows[0];
  }

  static async getUserData(userName) {
    const response = await pool.query("SELECT * FROM users WHERE name=$1", [
        userName,
    ]);

    if (!response.rows.length) {
      return null;
    }

    return response.rows[0]
  }

  static async getUserDataById(userId) {
    const response = await pool.query("SELECT * FROM users WHERE id=$1", [
      userId,
    ]);

    if (!response.rows.length) {
      return null;
    }

    return response.rows[0]
  }

  static async getUserBalance() {
    const { id } = getSavedUserData();
    if (!id) {
      throw new Error("No user ID found in memory");
    }

    const response = await pool.query("SELECT balance FROM users WHERE id=$1", [id]);

    if (!response.rows.length) {
      throw new Error("User not found");
    }

    return response.rows[0].balance;
  }

  static async getUserBalanceById(id) {
    if (!id) {
      throw new Error("No user ID found in memory");
    }

    const response = await pool.query("SELECT balance FROM users WHERE id=$1", [id]);

    if (!response.rows.length) {
      throw new Error("User not found");
    }

    return response.rows[0].balance;
  }

  static async setUserBalance(newBalance) {
    const { id } = getSavedUserData();
    if (!id) {
      throw new Error("No user ID found in memory");
    }

    const response = await pool.query("UPDATE users SET balance=$1 WHERE id=$2 RETURNING *", [newBalance, id]);

    if (!response.rows.length) {
      throw new Error("User not found");
    }

    return response.rows[0].balance;
  }

  static async setUserBalanceById(id, newBalance) {
    if (!id) {
      throw new Error("No user ID found in memory");
    }

    const response = await pool.query("UPDATE users SET balance=$1 WHERE id=$2 RETURNING *", [newBalance, id]);

    if (!response.rows.length) {
      throw new Error("User not found");
    }

    return response.rows[0].balance;
  }

}

export default UserRepository;
