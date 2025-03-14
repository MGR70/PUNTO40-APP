import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { deudor_id, ganador_id, monto } = req.body;

    // Log para verificar la solicitud
    console.log('Solicitud recibida:', { deudor_id, ganador_id, monto });

    try {
      console.log('Conectando a la base de datos...');
      console.log('Registrando deuda:', { deudor_id, ganador_id, monto });
      const result = await sql`
        INSERT INTO Deudas (deudor_id, ganador_id, monto)
        VALUES (${deudor_id}, ${ganador_id}, ${monto})
        RETURNING *;
      `;
      console.log('Deuda registrada:', result.rows[0]);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error al registrar la deuda:', error);
      res.status(500).json({ error: 'Error al registrar la deuda' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
