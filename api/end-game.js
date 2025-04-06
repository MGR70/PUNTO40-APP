// api/end-game.js
import { neon } from '@neondatabase/serverless';

export const config = {
  runtime: 'edge',
};

export default async (request) => { // Cambiado a (request)
     if (request.method !== 'POST') { // Mantenemos POST por simplicidad
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const { gameId } = await request.json(); // Leer body

        if (!gameId) {
            return new Response(JSON.stringify({ message: 'Game ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const sql = neon(process.env.DATABASE_URL);
        const result = await sql`DELETE FROM games WHERE id = ${gameId}`;

        if (result.rowCount > 0) {
            return new Response(JSON.stringify({ success: true, message: 'Game ended and data deleted.' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } else {
            return new Response(JSON.stringify({ success: false, message: 'Game not found.' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

    } catch (error) {
        console.error('Error ending game:', error);
         return new Response(JSON.stringify({ message: 'Error ending game', error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};