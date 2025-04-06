// api/start-game.js
import { neon } from '@neondatabase/serverless';

export const config = {
  runtime: 'edge', // Mantenemos el runtime edge
};

export default async (request) => { // Cambiado de (req, res) a (request)
    // Solo permitir método POST
    if (request.method !== 'POST') {
        // Cambiada la forma de responder
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const sql = neon(process.env.DATABASE_URL);
        const result = await sql`INSERT INTO games DEFAULT VALUES RETURNING id`;
        const newGameId = result[0].id;

        // Cambiada la forma de responder
        return new Response(JSON.stringify({ gameId: newGameId }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error starting game:', error);
         // Cambiada la forma de responder
        return new Response(JSON.stringify({ message: 'Error starting new game', error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};