// ----- INICIO CÓDIGO script.js (CHECKPOINT - Lógica Revertida) -----
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando selección de elementos...");

    // --- Selección de Elementos del DOM ---
    // Usaremos selección directa y verificaremos las críticas
    let criticalElementMissing = false;
    function checkElement(element, id, isCritical = true) {
        if (!element && isCritical) {
            console.error(`****** ERROR CRÍTICO: No se encontró elemento requerido con ID="${id}" ******`);
            criticalElementMissing = true;
        } else if (!element && !isCritical) {
             console.warn(`Advertencia: Elemento opcional con ID="${id}" no encontrado.`);
        }
        return element;
    }

    const welcomePage = checkElement(document.getElementById('welcome-page'), 'welcome-page');
    const registerPlayersPage = checkElement(document.getElementById('register-players-page'), 'register-players-page');
    const registerDebtsPage = checkElement(document.getElementById('register-debts-page'), 'register-debts-page');
    const startGameButton = checkElement(document.getElementById('start-game'), 'start-game');
    // Seleccionamos el botón continuar, pero NO le añadiremos listener en esta versión
    const continueGameButton = checkElement(document.getElementById('continue-game'), 'continue-game', false); // Marcar como no crítico
    const registerPlayerButton = checkElement(document.getElementById('register-player'), 'register-player');
    const finishRegistrationButton = checkElement(document.getElementById('finish-registration'), 'finish-registration');
    const addNewPlayerButton = checkElement(document.getElementById('add-new-player'), 'add-new-player');
    const registerDebtButton = checkElement(document.getElementById('register-debt'), 'register-debt');
    const endGameButton = checkElement(document.getElementById('end-game'), 'end-game');
    const playerNameInput = checkElement(document.getElementById('player-name'), 'player-name');
    const playerList = checkElement(document.getElementById('player-list'), 'player-list');
    const debtorSelect = checkElement(document.getElementById('debtor'), 'debtor');
    const winnerSelect = checkElement(document.getElementById('winner'), 'winner');
    const debtAmountInput = checkElement(document.getElementById('debt-amount'), 'debt-amount');
    const debtMatrixTable = checkElement(document.getElementById('debt-matrix'), 'debt-matrix');
    // El modal no es crítico para esta lógica
    const modal = checkElement(document.getElementById('custom-confirm-modal'), 'custom-confirm-modal', false);

    let debtMatrixThead = null; let debtMatrixTbody = null;
    if (debtMatrixTable) { debtMatrixThead = debtMatrixTable.querySelector('thead'); debtMatrixTbody = debtMatrixTable.querySelector('tbody'); if (!debtMatrixThead || !debtMatrixTbody) criticalElementMissing = true; }
    else { criticalElementMissing = true; }

    if (criticalElementMissing) { console.error("Inicialización detenida..."); alert("Error crítico..."); return; }
    console.log("Selección de elementos completada.");

    // --- Estado de la Aplicación ---
    let currentGameId = null; let currentPlayers = []; let currentDebts = []; let summary = {};

    // --- Helper para llamadas a la API (Mantenemos v3 Robusta con Logs Extremos) ---
    async function apiRequest(endpoint, method = 'GET', body = null) {
        const options = { method, headers: {} };
        if (body) { options.headers['Content-Type'] = 'application/json'; options.body = JSON.stringify(body); }
        console.log(`>>> apiRequest: INICIO para ${method} /api/${endpoint}`);
        try {
            console.log(`>>> apiRequest: Ejecutando fetch...`);
            const response = await fetch(`/api/${endpoint}`, options);
            console.log(`>>> apiRequest: Fetch completado. Status: ${response.status}, ok: ${response.ok}`);
            if (!response.ok) {
                console.log(`>>> apiRequest: Respuesta NO ok (${response.status})...`); let errorData = { message: `Error HTTP ${response.status}` }; try { errorData = await response.json(); console.log(`>>> apiRequest: Error JSON:`, errorData); } catch (eJson) { console.log(`>>> apiRequest: Falló leer error JSON... Intentando texto...`); try { const errorText = await response.text(); console.log(`>>> apiRequest: Error Texto: ${errorText}`); errorData.message = errorText || errorData.message; } catch (eText) { console.error(`>>> apiRequest: Falló leer error Texto.`); } }
                console.log(`>>> apiRequest: Lanzando error HTTP: ${errorData.message}`); throw new Error(errorData.message || `Request failed with status ${response.status}`);
            }
            console.log(`>>> apiRequest: Respuesta OK (${response.status})...`);
            if (response.status === 204) { console.log(`>>> apiRequest: Status 204. Devolviendo null.`); return null; }
            console.log(`>>> apiRequest: Intentando response.json()...`);
            try {
                const responseClone = response.clone(); const data = await response.json(); console.log(`>>> apiRequest: response.json() OK. Datos:`, data); return data;
            } catch (eJsonParse) {
                console.error(`>>> apiRequest: ¡FALLÓ response.json()! Error: ${eJsonParse.message}`); try { const responseText = await responseClone.text(); console.error(`>>> apiRequest: Cuerpo respuesta fallida: ${responseText}`); } catch (eTextRead) { console.error(`>>> apiRequest: Falló leer texto tras fallo JSON.`); }
                 console.log(`>>> apiRequest: Lanzando error por fallo parseo.`); throw new Error(`Respuesta inesperada: no JSON.`);
            }
        } catch (error) {
            console.error(`>>> apiRequest: ****** ERROR FINAL CAPTURADO para /api/${endpoint} ******:`, error);
            // El alert se podría mover al listener que llama si preferimos
            alert(`Error de comunicación: ${error.message}. Intenta de nuevo.`);
            throw error;
        }
    }
    // --- FIN Helper ---

    // --- Lógica de Inicio y Carga (Vuelve a usar confirm()) ---
    function loadExistingGame() {
        const savedGameId = localStorage.getItem('currentGameId');
        if (savedGameId) {
            console.log("Juego guardado encontrado:", savedGameId);
            // Pregunta al usuario si desea continuar
            if (confirm('¿Deseas continuar con el último juego guardado?')) {
                console.log("Usuario confirmó continuar.");
                currentGameId = savedGameId;
                fetchAndDisplayGameState(); // Carga datos y muestra página de deudas/registro
            } else {
                // El usuario no quiere continuar, pero NO borramos el ID aquí aún.
                // Simplemente mostramos la bienvenida. El ID se borrará si inicia uno nuevo.
                console.log("Usuario canceló continuar. Mostrando bienvenida.");
                showPage('welcome-page');
            }
        } else {
            console.log("No se encontró juego guardado. Mostrando bienvenida.");
            showPage('welcome-page'); // No hay juego guardado, mostrar bienvenida
        }
         // Asegurarse que el botón continuar (aunque inactivo) refleje el estado
         if (continueGameButton) continueGameButton.disabled = !savedGameId;
    }

    // Función para cargar datos (sin cambios lógicos)
    async function fetchAndDisplayGameState() {
        if (!currentGameId) return;
        console.log("fetchAndDisplayGameState: Cargando ID:", currentGameId);
        try {
            const gameState = await apiRequest(`get-game-state?gameId=${currentGameId}`, 'GET');
            console.log("Estado recibido:", gameState);
            currentPlayers = gameState.players || [];
            currentDebts = gameState.debts || [];
            updatePlayerList(); updateSelectOptions(); calculateDebtSummary(); updateDebtMatrix();
            if (currentPlayers.length < 2) { // Si el juego guardado tenía < 2 jugadores
                 console.log("Juego cargado tiene < 2 jugadores. Yendo a registro.");
                 showPage('register-players-page'); if(playerNameInput) playerNameInput.focus();
            } else {
                 console.log("Juego cargado. Yendo a registro de deudas.");
                 showPage('register-debts-page');
            }
        } catch (error) {
            alert(`Error al cargar estado del juego (ID: ${currentGameId}).`);
            console.error("Error fetching game state:", error);
            localStorage.removeItem('currentGameId'); currentGameId = null; resetLocalState();
             if(continueGameButton) continueGameButton.disabled = true;
            showPage('welcome-page');
        }
    }

    // --- Navegación entre Páginas ---

    // Listener para Iniciar Nuevo Juego (Lógica simple de checkpoint)
    startGameButton.addEventListener('click', async () => {
        console.log("Botón 'Iniciar Nuevo Juego' presionado.");
        // Opcional: Advertir si hay un juego activo que se sobrescribirá
        if (localStorage.getItem('currentGameId')) {
            if (!confirm('Al iniciar un juego nuevo, se perderá el acceso rápido al juego anterior (a menos que lo finalices y guardes). ¿Continuar?')) {
                console.log("Usuario canceló iniciar nuevo juego.");
                return;
            }
             console.log("Usuario confirmó iniciar nuevo, sobrescribiendo acceso rápido anterior.");
        }

        console.log("Preparando para iniciar nuevo juego...");
        currentGameId = null; // Asegura limpiar ID viejo si lo había
        resetLocalState();
        // No necesitamos deshabilitar/habilitar el botón continuar aquí, loadExistingGame lo hará al recargar

        console.log("Intentando iniciar nuevo juego vía API...");
        try {
            // Llama a la API para crear un nuevo juego
            const data = await apiRequest('start-game', 'POST'); // Usamos la v3 robusta

            // Verificar si la respuesta es válida ANTES de usarla
             if (!data || !data.gameId) {
                 throw new Error("Respuesta de API inválida al crear juego: no se recibió gameId.");
             }
            currentGameId = data.gameId;
            localStorage.setItem('currentGameId', currentGameId); // Guarda el NUEVO ID
            console.log("Nuevo juego iniciado con ID:", currentGameId);

            // Actualizar UI para el nuevo juego vacío
            updatePlayerList(); updateSelectOptions(); updateDebtMatrix();

            console.log("Mostrando página 'register-players-page'.");
            showPage('register-players-page');
            if(playerNameInput) playerNameInput.focus();

        } catch (error) {
            // apiRequest ya mostró un alert
            console.error("****** ERROR CAPTURADO en startGameButton ******:", error);
            // Limpiar por si acaso
            localStorage.removeItem('currentGameId'); currentGameId = null; resetLocalState();
            if(continueGameButton) continueGameButton.disabled = true;
            showPage('welcome-page'); // Volver a bienvenida si falla
        }
    });

    // Listener para Ir a Registro de Deudas (sin cambios)
    finishRegistrationButton.addEventListener('click', () => { /* ... código sin cambios ... */ });
    // Listener para Agregar Más Jugadores (sin cambios)
    addNewPlayerButton.addEventListener('click', () => { /* ... código sin cambios ... */ });

    // --- Lógica de Jugadores (sin cambios) ---
    registerPlayerButton.addEventListener('click', async () => { /* ... código sin cambios ... */ });
    playerNameInput.addEventListener('keypress', (event) => { /* ... */ });

    // --- Lógica de Deudas (sin cambios) ---
    registerDebtButton.addEventListener('click', async () => { /* ... código sin cambios ... */ });

    // --- Lógica de Finalización (Vuelve a usar confirm() simple) ---
    endGameButton.addEventListener('click', async () => {
         if (!currentGameId) { alert("No hay ningún juego activo para finalizar."); return; }
         console.log("Botón Finalizar Juego presionado.");

         // Pregunta simple para confirmar borrado
        if (confirm('¿Estás seguro de que deseas finalizar y BORRAR permanentemente todos los datos de este juego?')) {
            console.log("Usuario confirmó borrar juego.");
            console.log("Intentando borrar juego vía API...");
             try {
                 await apiRequest('end-game', 'POST', { gameId: currentGameId });
                 console.log("Juego borrado con éxito vía API.");
             } catch (error) {
                  console.error("Falló la llamada a API para borrar juego (puede que ya no existiera):", error);
                  // Igual limpiamos localmente
             }
              // Siempre limpiar localmente después de intentar borrar
              localStorage.removeItem('currentGameId');
              currentGameId = null;
              resetLocalState();
              if(continueGameButton) continueGameButton.disabled = true;
              showPage('welcome-page');
        } else {
            console.log("Usuario canceló borrar juego.");
            // No hacer nada, permanecer en la página de deudas
        }
    });

    // --- Funciones Auxiliares ---
    function showPage(pageId) { /* ... código sin cambios con logs detallados ... */ }
    function updatePlayerList() { /* ... código sin cambios ... */ }
    function updateSelectOptions() { /* ... código sin cambios con DEBUG logs ... */ }
    function initializeDebtSummary() { /* ... código sin cambios ... */ }
    function calculateDebtSummary() { /* ... código sin cambios ... */ }
    function updateDebtMatrix() { /* ... código sin cambios ... */ }
    function resetLocalState() { /* ... código sin cambios ... */ }

    // --- Inicialización Final ---
    console.log("Inicialización JS completada. Llamando a loadExistingGame...");
    loadExistingGame(); // <--- LLAMA A LA VERSIÓN CON confirm()

}); // Fin del DOMContentLoaded
// ----- FIN CÓDIGO script.js (CHECKPOINT - Lógica Revertida) -----