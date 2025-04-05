// api/add-debt.js
import { neon } from '@neondatabase/serverless';

export default async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { gameId, debtor, winner, amount } = await req.json();

        if (!gameId || !debtor || !winner || amount === undefined || amount === null) {
            return res.status(400).json({ message: 'Game ID, debtor, winner, and amount are required' });
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ message: 'Amount must be a positive number' });
        }

        const sql = neon(process.env.DATABASE_URL);

        // Insertar la deuda
        await sql`INSERT INTO debts (game_id, debtor_name, winner_name, amount)
                  VALUES (${gameId}, ${debtor}, ${winner}, ${parsedAmount})`;

        return res.status(201).json({ success: true, message: 'Debt added' });

    } catch (error) {
        console.error('Error adding debt:', error);
        return res.status(500).json({ message: 'Error adding debt', error: error.message });
    }
};

export const config = {
  runtime: 'edge',
};