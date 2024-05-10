import pool from "../db.js";

class TransferRepository {
    static async createTransferUser({ senderId, amount, receiverId }) {
        const response = await pool.query(
            "INSERT INTO transfers (sender_id, amount, receiver_id, description) VALUES ($1, $2, $3, $4) RETURNING *",
            [senderId, amount, receiverId, 'transfer'],
        );

        return response.rows[0];
    }
    static async createTransferAdmin({ senderId, amount, receiverId }) {
        const response = await pool.query(
            "INSERT INTO transfers (sender_id, amount, receiver_id, description) VALUES ($1, $2, $3, $4) RETURNING *",
            [senderId, amount, receiverId, 'salary'],
        );

        return response.rows[0];
    }

    static async getUserTransfers(id) {
        const response = await pool.query("SELECT * FROM transfers WHERE sender_id=$1 OR receiver_id=$1",
            [id,]);

        if (!response.rows.length) {
            return null;
        }

        return response.rows[0]
    }
}

export default TransferRepository;