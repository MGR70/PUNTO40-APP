// api/add-player.js
import { neon } from '@neondatabase/serverless';

export default async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // Obtener datos del cuerpo de la solicitud (enviados desde el frontend)
        const { gameId, playerName } = await req.json(); // Leer JSON del body

        if (!gameId || !playerName || typeof playerName !== 'string' || playerName.trim() === '') {
            return res.status(400).json({ message: 'Game ID and valid Player Name are required' });
        }

        const sql = neon(process.env.DATABASE_URL);

        // Intentar insertar el jugador. Si ya existe en ESE juego, dará error por la restricción UNIQUE.
        try {
            await sql`INSERT INTO players (game_id, name) VALUES (${gameId}, ${playerName.trim()})`;
             // Devolver solo éxito si se añade
             return res.status(201).json({ success: true, message: 'Player added' });
        } catch (dbError) {
            // Manejar error específico de violación de unicidad (jugador ya existe)
            if (dbError.message.includes('duplicate key value violates unique constraint')) {
                 return res.status(409).json({ success: false, message: `Player "${playerName.trim()}" already exists in this game.` });
            }
            // Si es otro error de BD, lanzarlo para que lo capture el catch exterior
            throw dbError;
        }

    } catch (error) {
        console.error('Error adding player:', error);
        return res.status(500).json({ message: 'Error adding player', error: error.message });
    }
};

export const config = {
  runtime: 'edge',
};