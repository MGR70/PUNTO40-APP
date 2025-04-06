// api/add-player.js
import { neon } from '@neondatabase/serverless';

export const config = {
  runtime: 'edge',
};

export default async (request) => { // Cambiado a (request)
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        // Leer JSON del body usando request.json()
        const { gameId, playerName } = await request.json();

        if (!gameId || !playerName || typeof playerName !== 'string' || playerName.trim() === '') {
             return new Response(JSON.stringify({ message: 'Game ID and valid Player Name are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const sql = neon(process.env.DATABASE_URL);

        try {
            await sql`INSERT INTO players (game_id, name) VALUES (${gameId}, ${playerName.trim()})`;
            return new Response(JSON.stringify({ success: true, message: 'Player added' }), { status: 201, headers: { 'Content-Type': 'application/json' } });
        } catch (dbError) {
            if (dbError.message.includes('duplicate key value violates unique constraint')) {
                 return new Response(JSON.stringify({ success: false, message: `Player "${playerName.trim()}" already exists in this game.` }), { status: 409, headers: { 'Content-Type': 'application/json' } });
            }
            throw dbError;
        }

    } catch (error) {
        console.error('Error adding player:', error);
        return new Response(JSON.stringify({ message: 'Error adding player', error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};