// api/start-game.js
import { neon } from '@neondatabase/serverless';

export const config = {
  runtime: 'edge', // Asegura que esta línea esté presente
};

export default async (request) => { // Debe recibir 'request'
    // Solo permitir método POST
    if (request.method !== 'POST') {
        // Devuelve un objeto 'Response'
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Añadimos un log aquí para ver si la función se ejecuta
    console.log("API start-game: Función ejecutada, método POST recibido.");

    try {
        console.log("API start-game: Conectando a Neon...");
        const sql = neon(process.env.DATABASE_URL); // Variable de entorno
        if (!process.env.DATABASE_URL) {
             console.error("API start-game: ¡ERROR! Variable de entorno DATABASE_URL no definida.");
             throw new Error("Configuración del servidor incompleta.");
        }

        console.log("API start-game: Ejecutando INSERT en tabla 'games'...");
        // Asegúrate que tu tabla se llame 'games' y tenga 'id' y permita DEFAULT VALUES
        const result = await sql`INSERT INTO games DEFAULT VALUES RETURNING id`;
        console.log("API start-game: INSERT completado. Resultado:", result);

        // Verificar si el resultado es el esperado
        if (!result || result.length === 0 || !result[0].id) {
             console.error("API start-game: ¡ERROR! La consulta INSERT no devolvió un ID válido:", result);
             throw new Error("Error al crear el juego en la base de datos.");
        }

        const newGameId = result[0].id;
        console.log("API start-game: Nuevo gameId obtenido:", newGameId);

        // Devuelve un objeto 'Response' con el ID
        return new Response(JSON.stringify({ gameId: newGameId }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        // Loguear el error en el backend (Vercel logs)
        console.error('API start-game: ****** ERROR CAPTURADO ******:', error);

        // Devuelve un objeto 'Response' con el mensaje de error
        return new Response(JSON.stringify({
             message: 'Error interno al iniciar nuevo juego',
             // No exponer detalles del error de BD al cliente por seguridad,
             // pero podemos poner un mensaje genérico. El log de Vercel tendrá los detalles.
             // error: error.message // Comentado por seguridad
            }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};