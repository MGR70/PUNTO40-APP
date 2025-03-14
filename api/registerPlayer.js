import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { nombre } = req.body;

    // Log para verificar la solicitud
    console.log('Solicitud recibida:', { nombre });

    try {
      console.log('Conectando a la base de datos...');
      console.log('Registrando jugador:', nombre);
      const result = await sql`
        INSERT INTO Jugadores (nombre)
        VALUES (${nombre})
        RETURNING *;
      `;
      console.log('Jugador registrado:', result.rows[0]);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error al registrar el jugador:', error);
      res.status(500).json({ error: 'Error al registrar el jugador' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
