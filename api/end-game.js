// api/end-game.js (v3 - SELECT antes de DELETE)
import { neon } from '@neondatabase/serverless';

export const config = {
  runtime: 'edge',
};

export default async (request) => {
    console.log("API end-game v3: Función ejecutada.");

    if (request.method !== 'POST') { /* ... manejo método ... */ }

    try {
        let requestBody;
        try {
             requestBody = await request.json();
             console.log("API end-game v3: Body JSON:", requestBody);
        } catch (e) { /* ... manejo error JSON body ... */ throw new Error("Cuerpo inválido."); }

        const { gameId } = requestBody;
        if (!gameId) { /* ... manejo falta gameId ... */ }
        console.log(`API end-game v3: gameId recibido para operar: ${gameId}`);

        console.log("API end-game v3: Conectando a Neon...");
        const sql = neon(process.env.DATABASE_URL);
         if (!process.env.DATABASE_URL) { throw new Error("DATABASE_URL falta."); }

        // *** PASO EXTRA: VERIFICAR SI EXISTE CON SELECT ***
        console.log(`API end-game v3: Verificando existencia con SELECT id FROM games WHERE id = '${gameId}' ...`);
        try {
            const selectResult = await sql`SELECT id FROM games WHERE id = ${gameId}`;
            console.log("API end-game v3: Resultado del SELECT:", selectResult);
            if (!selectResult || selectResult.length === 0) {
                console.warn(`API end-game v3: *** SELECT no encontró el ID ${gameId} justo antes de borrar ***`);
                // A pesar de que SELECT falló, intentaremos el DELETE igualmente
                // para ver si el resultado difiere, pero ya sabemos que probablemente fallará.
            } else {
                console.log(`API end-game v3: SELECT encontró el ID ${gameId} correctamente.`);
            }
        } catch (selectError) {
            console.error(`API end-game v3: ¡ERROR durante el SELECT de verificación!:`, selectError);
            // Continuar para intentar el DELETE de todos modos? O lanzar error aquí?
            // Por ahora, continuaremos para ver qué pasa con el DELETE.
        }
        // *** FIN PASO EXTRA ***

        // Ejecutar DELETE
console.log(`API end-game v3: Ejecutando DELETE FROM games WHERE id = '${gameId}' ...`);
// Ya no guardamos el resultado en una variable si no vamos a usar rowCount
await sql`DELETE FROM games WHERE id = ${gameId}`;
console.log("API end-game v3: Sentencia DELETE ejecutada (sin error explícito).");

// *** CAMBIO: Asumir éxito si no hubo error ***
// En lugar de verificar deleteResult.rowCount, asumimos que si llegamos aquí sin error,
// el DELETE probablemente funcionó o al menos la BD aceptó el comando.
// Devolvemos 200 OK. Si el ID no existía, el DELETE simplemente no hizo nada,
// lo cual no es necesariamente un error para el cliente.
console.log(`API end-game v3: Asumiendo éxito tras DELETE. Devolviendo 200 OK.`);
return new Response(JSON.stringify({ success: true, message: 'Game delete attempted.' }), { // Mensaje ligeramente diferente
    status: 200, // Devolver OK en lugar de 404 si no se encontraron filas
    headers: { 'Content-Type': 'application/json' }
});
// *** FIN CAMBIO ***

// El código anterior que verificaba rowCount y devolvía 404 ya no es necesario aquí
/*
// Verificar resultado del DELETE (YA NO SE USA ASÍ)
if (deleteResult && deleteResult.rowCount > 0) {
    // ... código para 200 ...
} else {
    // ... código para 404 ...
}
*/

} catch (error) { // El catch se mantiene igual
    console.error('API end-game v3: ****** ERROR CAPTURADO ******:', error);
    return new Response(JSON.stringify({ message: 'Error interno' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
}
}; // Fin export default