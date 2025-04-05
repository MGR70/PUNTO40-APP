// api/start-game.js
import { neon } from '@neondatabase/serverless';

// Exporta la función que Vercel ejecutará
export default async (req, res) => {
    // Solo permitir método POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // Conectar a la base de datos usando la variable de entorno
        const sql = neon(process.env.DATABASE_URL);

        // Insertar un nuevo juego y obtener su ID
        const result = await sql`INSERT INTO games DEFAULT VALUES RETURNING id`;
        const newGameId = result[0].id;

        // Devolver el ID del nuevo juego al frontend
        return res.status(201).json({ gameId: newGameId });

    } catch (error) {
        console.error('Error starting game:', error);
        return res.status(500).json({ message: 'Error starting new game', error: error.message });
    }
};

// Configuración para Vercel (importante para Neon)
export const config = {
  runtime: 'edge', // Usa el runtime edge de Vercel, bueno para BD
};