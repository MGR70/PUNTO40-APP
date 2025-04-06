// api/get-game-state.js
import { neon } from '@neondatabase/serverless';

export const config = {
  runtime: 'edge',
};

export default async (request) => { // Cambiado a (request)
     if (request.method !== 'GET') {
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        // Obtener query params de la URL
         const url = new URL(request.url);
         const gameId = url.searchParams.get('gameId');

        if (!gameId) {
            return new Response(JSON.stringify({ message: 'Game ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const sql = neon(process.env.DATABASE_URL);
        const [playersResult, debtsResult] = await Promise.all([
            sql`SELECT name FROM players WHERE game_id = ${gameId} ORDER BY created_at ASC`,
            sql`SELECT debtor_name, winner_name, amount FROM debts WHERE game_id = ${gameId} ORDER BY created_at ASC`
        ]);

        const players = playersResult.map(p => p.name);
        const debts = debtsResult.map(d => ({
            debtor: d.debtor_name,
            winner: d.winner_name,
            amount: parseFloat(d.amount)
        }));

        return new Response(JSON.stringify({ players, debts }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error getting game state:', error);
        return new Response(JSON.stringify({ message: 'Error fetching game state', error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};