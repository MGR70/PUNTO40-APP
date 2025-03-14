import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { nombre } = req.body;

    try {
      const result = await sql`
        INSERT INTO Jugadores (nombre)
        VALUES (${nombre})
        RETURNING *;
      `;
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al registrar el jugador' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
