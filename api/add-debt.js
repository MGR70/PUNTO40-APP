// api/add-debt.js
import { neon } from '@neondatabase/serverless';

export const config = {
  runtime: 'edge',
};

export default async (request) => { // Cambiado a (request)
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const { gameId, debtor, winner, amount } = await request.json(); // Leer body

        if (!gameId || !debtor || !winner || amount === undefined || amount === null) {
            return new Response(JSON.stringify({ message: 'Game ID, debtor, winner, and amount are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return new Response(JSON.stringify({ message: 'Amount must be a positive number' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const sql = neon(process.env.DATABASE_URL);
        await sql`INSERT INTO debts (game_id, debtor_name, winner_name, amount)
                  VALUES (${gameId}, ${debtor}, ${winner}, ${parsedAmount})`;

        return new Response(JSON.stringify({ success: true, message: 'Debt added' }), { status: 201, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('Error adding debt:', error);
         return new Response(JSON.stringify({ message: 'Error adding debt', error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};