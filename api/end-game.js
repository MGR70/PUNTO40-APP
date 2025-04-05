// api/end-game.js
import { neon } from '@neondatabase/serverless';

export default async (req, res) => {
    // Usaremos POST para la acción de borrar, aunque DELETE sería más semántico,
    // es más simple enviar el gameId en el body con POST desde JS básico.
     if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { gameId } = await req.json();

        if (!gameId) {
            return res.status(400).json({ message: 'Game ID is required' });
        }

        const sql = neon(process.env.DATABASE_URL);

        // Borrar el juego. Gracias a "ON DELETE CASCADE",
        // esto borrará también los jugadores y deudas asociados.
        const result = await sql`DELETE FROM games WHERE id = ${gameId}`;

        if (result.rowCount > 0) {
            return res.status(200).json({ success: true, message: 'Game ended and data deleted.' });
        } else {
            // Si rowCount es 0, el juego no existía (quizás ya se borró)
            return res.status(404).json({ success: false, message: 'Game not found.' });
        }

    } catch (error) {
        console.error('Error ending game:', error);
        return res.status(500).json({ message: 'Error ending game', error: error.message });
    }
};

export const config = {
  runtime: 'edge',
};