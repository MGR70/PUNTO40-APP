// api/get-game-state.js
import { neon } from '@neondatabase/serverless';

export default async (req, res) => {
     // Permitir solo GET
     if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // Obtener gameId de los parámetros de la URL (ej: /api/get-game-state?gameId=...)
        // Vercel pone los query params en req.searchParams con runtime edge
         const url = new URL(req.url, `http://${req.headers.host}`); // Necesitamos la URL completa
         const gameId = url.searchParams.get('gameId');


        if (!gameId) {
            return res.status(400).json({ message: 'Game ID is required' });
        }

        const sql = neon(process.env.DATABASE_URL);

        // Ejecutar ambas consultas en paralelo para eficiencia
        const [playersResult, debtsResult] = await Promise.all([
            sql`SELECT name FROM players WHERE game_id = ${gameId} ORDER BY created_at ASC`,
            sql`SELECT debtor_name, winner_name, amount FROM debts WHERE game_id = ${gameId} ORDER BY created_at ASC`
        ]);

        // Extraer solo los nombres de los jugadores
        const players = playersResult.map(p => p.name);
        // Mapear las deudas al formato que usa el frontend
        const debts = debtsResult.map(d => ({
            debtor: d.debtor_name,
            winner: d.winner_name,
            amount: parseFloat(d.amount) // Asegurarse que sea número
        }));

        // Devolver el estado completo del juego
        return res.status(200).json({ players, debts });

    } catch (error) {
        console.error('Error getting game state:', error);
        return res.status(500).json({ message: 'Error fetching game state', error: error.message });
    }
};

export const config = {
  runtime: 'edge',
};