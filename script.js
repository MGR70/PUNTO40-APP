// ----- INICIO CÓDIGO script.js COMPLETO (v9 - Checkpoint + showPage OK + Logs RegisterPlayer) -----
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando selección de elementos...");

    // --- Selección de Elementos del DOM ---
    let criticalElementMissing = false;
    function checkElement(element, id, isCritical = true) {
        if (!element && isCritical) {
            console.error(`****** ERROR CRÍTICO: No se encontró elemento requerido con ID="${id}" ******`);
            criticalElementMissing = true;
        } else if (!element && !isCritical) {
            // Silenciado warning para botón continuar opcional
            // console.warn(`Advertencia: Elemento opcional con ID="${id}" no encontrado.`);
        }
        return element;
    }

    // Seleccionar elementos directamente y verificar
    const welcomePage = checkElement(document.getElementById('welcome-page'), 'welcome-page');
    const registerPlayersPage = checkElement(document.getElementById('register-players-page'), 'register-players-page');
    const registerDebtsPage = checkElement(document.getElementById('register-debts-page'), 'register-debts-page');
    const startGameButton = checkElement(document.getElementById('start-game'), 'start-game');
    const continueGameButton = checkElement(document.getElementById('continue-game'), 'continue-game', false); // No crítico
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
    const modal = checkElement(document.getElementById('custom-confirm-modal'), 'custom-confirm-modal', false); // No crítico

    let debtMatrixThead = null; let debtMatrixTbody = null;
    if (debtMatrixTable) {
        debtMatrixThead = debtMatrixTable.querySelector('thead'); debtMatrixTbody = debtMatrixTable.querySelector('tbody');
        if (!debtMatrixThead) { console.error("Error: No <thead> en #debt-matrix"); criticalElementMissing = true; }
        if (!debtMatrixTbody) { console.error("Error: No <tbody> en #debt-matrix"); criticalElementMissing = true; }
    } else { criticalElementMissing = true; } // Tabla es crítica

    if (criticalElementMissing) {
        console.error("****** Inicialización detenida: Faltan elementos HTML críticos. ******");
        alert("Error crítico al inicializar la aplicación. Faltan elementos HTML esenciales. Revisa la consola (F12).");
        if (welcomePage) welcomePage.innerHTML = "<h1>Error Crítico</h1><p>Faltan elementos HTML. Revisa la consola.</p>";
        document.querySelectorAll('.page').forEach(p => { if(p && p !== welcomePage && p.style) p.style.display = 'none'; });
        return; // Detener JS
    }
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
            alert(`Error de comunicación: ${error.message}. Intenta de nuevo.`);
            throw error;
        }
    }
    // --- FIN Helper ---

    // --- Lógica de Inicio y Carga (Vuelve a usar confirm()) ---
    function loadExistingGame() {
        const savedGameId = localStorage.getItem('currentGameId');
        if (savedGameId) {
            console.log("loadExistingGame: Juego guardado encontrado:", savedGameId);
            if (confirm('¿Deseas continuar con el último juego guardado?')) {
                console.log("loadExistingGame: Usuario confirmó continuar.");
                currentGameId = savedGameId;
                fetchAndDisplayGameState();
            } else {
                console.log("loadExistingGame: Usuario canceló continuar.");
                showPage('welcome-page');
            }
        } else {
            console.log("loadExistingGame: No se encontró juego guardado.");
            showPage('welcome-page');
        }
         // Habilitar/Deshabilitar botón continuar (si existe) basado en si hay ID guardado
         if (continueGameButton) {
             continueGameButton.disabled = !savedGameId;
             console.log(`loadExistingGame: Botón Continuar ${savedGameId ? 'HABILITADO' : 'DESHABILITADO'}.`);
         }
    }

    // Función para cargar datos
    async function fetchAndDisplayGameState() {
        if (!currentGameId) { console.error("fetchAndDisplayGameState: llamado sin currentGameId!"); return; }
        console.log("fetchAndDisplayGameState: Cargando ID:", currentGameId);
        try {
            const gameState = await apiRequest(`get-game-state?gameId=${currentGameId}`, 'GET');
            console.log("fetchAndDisplayGameState: Estado recibido:", gameState);
            currentPlayers = gameState.players || [];
            currentDebts = gameState.debts || [];
            updatePlayerList(); updateSelectOptions(); calculateDebtSummary(); updateDebtMatrix();
            if (currentPlayers.length < 2) {
                 console.log("fetchAndDisplayGameState: Juego cargado tiene < 2 jugadores. Yendo a registro.");
                 showPage('register-players-page'); if(playerNameInput) playerNameInput.focus();
            } else {
                 console.log("fetchAndDisplayGameState: Juego cargado OK. Yendo a registro de deudas.");
                 showPage('register-debts-page');
            }
        } catch (error) {
            alert(`Error al cargar estado del juego (ID: ${currentGameId}).`);
            console.error("fetchAndDisplayGameState: Error fetching game state:", error);
            localStorage.removeItem('currentGameId'); currentGameId = null; resetLocalState();
             if(continueGameButton) continueGameButton.disabled = true;
            showPage('welcome-page');
        }
    }

    // --- Navegación entre Páginas ---

    // Listener para Iniciar Nuevo Juego
    startGameButton.addEventListener('click', async () => {
        console.log("startGameButton: Botón presionado.");
        if (localStorage.getItem('currentGameId')) {
            if (!confirm('Al iniciar un juego nuevo, se perderá el acceso rápido al juego anterior. ¿Continuar?')) {
                console.log("startGameButton: Usuario canceló iniciar nuevo."); return;
            }
             console.log("startGameButton: Usuario confirmó iniciar nuevo...");
        }
        console.log("startGameButton: Preparando...");
        currentGameId = null; resetLocalState();
        if (continueGameButton) continueGameButton.disabled = true; // Deshabilitar mientras se crea

        console.log("startGameButton: Intentando API /api/start-game...");
        try {
            const data = await apiRequest('start-game', 'POST');
            if (!data || !data.gameId) { throw new Error("Respuesta API inválida: no gameId."); }
            currentGameId = data.gameId;
            localStorage.setItem('currentGameId', currentGameId);
            console.log("startGameButton: Nuevo juego iniciado con ID:", currentGameId);

            if (continueGameButton) continueGameButton.disabled = false; // Habilitar de nuevo

            updatePlayerList(); updateSelectOptions(); updateDebtMatrix();
            console.log("startGameButton: UI reseteada.");
            console.log("startGameButton: Mostrando 'register-players-page'.");
            showPage('register-players-page');
            if(playerNameInput) playerNameInput.focus();
        } catch (error) {
            console.error("startGameButton: ****** ERROR CAPTURADO ******:", error);
            localStorage.removeItem('currentGameId'); currentGameId = null; resetLocalState();
            if(continueGameButton) continueGameButton.disabled = true;
            showPage('welcome-page');
        }
    });

    // Listener para Ir a Registro de Deudas
    finishRegistrationButton.addEventListener('click', () => {
         if (currentPlayers.length < 2) { alert('Debes registrar al menos dos jugadores.'); return; }
         console.log("finishRegistrationButton: currentPlayers:", JSON.stringify(currentPlayers));
         updateSelectOptions();
         calculateDebtSummary();
         updateDebtMatrix();
         console.log("finishRegistrationButton: Mostrando página deudas...");
         showPage('register-debts-page');
    });

    // Listener para Agregar Más Jugadores
    addNewPlayerButton.addEventListener('click', () => {
         console.log("addNewPlayerButton: Mostrando 'register-players-page'.");
         showPage('register-players-page');
         if(playerNameInput) playerNameInput.focus();
     });

    // --- Lógica de Jugadores (con DEBUG Logs) ---
    registerPlayerButton.addEventListener('click', async () => {
        console.log("DEBUG RegisterPlayer: Botón presionado.");
        const playerName = playerNameInput.value.trim();
        console.log(`DEBUG RegisterPlayer: Nombre obtenido: "${playerName}"`);
        if (!playerName) { alert('Nombre vacío.'); console.log("DEBUG RegisterPlayer: Nombre vacío."); return; }
        if (currentPlayers.includes(playerName)) { alert(`Jugador "${playerName}" duplicado.`); console.log(`DEBUG RegisterPlayer: Jugador duplicado.`); if(playerNameInput) playerNameInput.select(); return; }
        if (!currentGameId) { alert("Error: No hay juego activo."); console.error("DEBUG RegisterPlayer: currentGameId es null."); return; }

        console.log(`DEBUG RegisterPlayer: Validaciones OK. Intentando API /api/add-player para ${currentGameId}...`);
        try {
            const responseData = await apiRequest('add-player', 'POST', { gameId: currentGameId, playerName });
            console.log("DEBUG RegisterPlayer: API /api/add-player completada:", responseData);
            console.log(`DEBUG RegisterPlayer: Añadiendo "${playerName}" a currentPlayers local.`);
            currentPlayers.push(playerName);
            console.log("DEBUG RegisterPlayer: Actualizando UI...");
            updatePlayerList(); updateSelectOptions(); calculateDebtSummary(); updateDebtMatrix();
            console.log("DEBUG RegisterPlayer: Limpiando input...");
            if (playerNameInput) { playerNameInput.value = ''; playerNameInput.focus(); }
            console.log("DEBUG RegisterPlayer: Proceso completado.");
        } catch (error) {
            console.error("****** ERROR CAPTURADO en registerPlayerButton ******:", error);
            if(playerNameInput) playerNameInput.select();
        }
    });
    // --- FIN Lógica de Jugadores ---

    playerNameInput.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); registerPlayerButton.click(); } });

    // --- Lógica de Deudas ---
    registerDebtButton.addEventListener('click', async () => { /* ... código sin cambios ... */ });

    // --- Lógica de Finalización (confirm() simple) ---
    endGameButton.addEventListener('click', async () => { /* ... código sin cambios de checkpoint ... */ });

    // --- Funciones Auxiliares ---
    function showPage(pageIdToShow) {
        console.log(`--- Intentando mostrar página: ${pageIdToShow} ---`);
        const pages = document.querySelectorAll('.page');
        if (!pages || pages.length === 0) { console.error("Error en showPage: No .page"); return; }
        let targetPageFound = false;
        console.log("   -> Ocultando todas las páginas (.page)...");
        pages.forEach(page => { if (page && page.style) page.style.display = 'none'; else console.warn("Elemento .page inválido:", page); });
        const targetPage = document.getElementById(pageIdToShow);
        if (targetPage && targetPage.classList.contains('page') && targetPage.style) {
            console.log(`   -> Mostrando página con ID: ${pageIdToShow}`); targetPage.style.display = 'block'; targetPageFound = true;
        } else { console.error(`   -> ¡ERROR! No se encontró/inválido .page con ID: ${pageIdToShow}`); if (targetPage) console.error("      Elemento:", targetPage); }
        console.log(`--- Fin de showPage para: ${pageIdToShow} (Encontrada: ${targetPageFound}) ---`);
    }

    function updatePlayerList() { playerList.innerHTML = ''; currentPlayers.forEach(player => { const li = document.createElement('li'); li.textContent = player; playerList.appendChild(li); }); console.log("updatePlayerList ejecutado."); }
    function updateSelectOptions() { /* ... código sin cambios con DEBUG logs ... */ }
    function initializeDebtSummary() { /* ... código sin cambios ... */ }
    function calculateDebtSummary() { /* ... código sin cambios ... */ }
    function updateDebtMatrix() { /* ... código sin cambios ... */ }
    function resetLocalState() { console.log("resetLocalState ejecutado."); currentPlayers = []; currentDebts = []; summary = {}; if(playerNameInput) playerNameInput.value = ''; if(debtAmountInput) debtAmountInput.value = ''; if(playerList) playerList.innerHTML = ''; updateSelectOptions(); updateDebtMatrix(); }

    // --- Inicialización Final ---
    console.log("Inicialización JS completada. Llamando a loadExistingGame...");
    loadExistingGame();

}); // Fin del DOMContentLoaded
// ----- FIN CÓDIGO script.js COMPLETO (v9 - Checkpoint + showPage OK + Logs RegisterPlayer) -----