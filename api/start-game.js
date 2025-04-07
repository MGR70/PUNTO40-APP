// api/start-game.js (VERSIÓN CHECKPOINT - Edge con Logs)
import { neon } from '@neondatabase/serverless';

export const config = {
  runtime: 'edge',
};

export default async (request) => {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }
    console.log("API start-game: Función ejecutada, método POST recibido."); // Log
    try {
        console.log("API start-game: Conectando a Neon..."); // Log
        const sql = neon(process.env.DATABASE_URL);
        if (!process.env.DATABASE_URL) { console.error("API start-game: ¡ERROR! DATABASE_URL no definida."); throw new Error("Configuración servidor incompleta."); }
        console.log("API start-game: Ejecutando INSERT..."); // Log
        const result = await sql`INSERT INTO games DEFAULT VALUES RETURNING id`;
        console.log("API start-game: INSERT completado. Resultado:", result); // Log
        if (!result || result.length === 0 || !result[0].id) { console.error("API start-game: ¡ERROR! INSERT no devolvió ID:", result); throw new Error("Error DB: No se creó ID."); }
        const newGameId = result[0].id;
        console.log("API start-game: Nuevo gameId obtenido:", newGameId); // Log
        return new Response(JSON.stringify({ gameId: newGameId }), { status: 201, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error('API start-game: ****** ERROR CAPTURADO ******:', error); // Log
        return new Response(JSON.stringify({ message: 'Error interno al iniciar juego' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};