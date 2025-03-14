import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log('Conectando a la base de datos...');
      console.log('Finalizando juego...');
      await sql`DELETE FROM Deudas;`;
      await sql`DELETE FROM Jugadores;`;
      console.log('Juego finalizado correctamente');
      res.status(200).json({ message: 'Juego finalizado correctamente' });
    } catch (error) {
      console.error('Error al finalizar el juego:', error);
      res.status(500).json({ error: 'Error al finalizar el juego' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
