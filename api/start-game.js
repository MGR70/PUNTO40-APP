// api/start-game.js (VERSIÓN DE PRUEBA SIMPLE)
export const config = {
    runtime: 'edge',
  };
  
  export default async (request) => {
      // Log para ver si se ejecuta
      console.log("API start-game (SIMPLE TEST): Función ejecutada.");
  
      if (request.method !== 'POST') {
          console.log("API start-game (SIMPLE TEST): Método no es POST.");
          return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
      }
  
      // Devolver un ID de juego falso directamente
      const fakeGameId = 'test-12345-abcde';
      console.log(`API start-game (SIMPLE TEST): Devolviendo ID falso: ${fakeGameId}`);
  
      return new Response(JSON.stringify({ gameId: fakeGameId }), {
          status: 201, // Usamos 201 como si fuera creado
          headers: { 'Content-Type': 'application/json' },
      });
  };