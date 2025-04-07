// ----- INICIO CÓDIGO script.js COMPLETO (Checkpoint + showPage Reforzado) -----
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando selección de elementos...");

    // --- Selección de Elementos del DOM ---
    let criticalElementMissing = false;
    function checkElement(element, id, isCritical = true) { if (!element && isCritical) { console.error(`****** ERROR CRÍTICO: No se encontró elemento requerido con ID="${id}" ******`); criticalElementMissing = true; } else if (!element && !isCritical) { console.warn(`Advertencia: Elemento opcional con ID="${id}" no encontrado.`); } return element; }

    const welcomePage = checkElement(document.getElementById('welcome-page'), 'welcome-page');
    const registerPlayersPage = checkElement(document.getElementById('register-players-page'), 'register-players-page');
    const registerDebtsPage = checkElement(document.getElementById('register-debts-page'), 'register-debts-page');
    const startGameButton = checkElement(document.getElementById('start-game'), 'start-game');
    const continueGameButton = checkElement(document.getElementById('continue-game'), 'continue-game', false);
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
            if (confirm('¿Deseas continuar con el último juego guardado?')) {
                console.log("Usuario confirmó continuar.");
                currentGameId = savedGameId;
                fetchAndDisplayGameState();
            } else {
                console.log("Usuario canceló continuar. Mostrando bienvenida.");
                showPage('welcome-page');
            }
        } else {
            console.log("No se encontró juego guardado. Mostrando bienvenida.");
            showPage('welcome-page');
        }
         if (continueGameButton) continueGameButton.disabled = !savedGameId;
    }

    // Función para cargar datos
    async function fetchAndDisplayGameState() {
        if (!currentGameId) return;
        console.log("fetchAndDisplayGameState: Cargando ID:", currentGameId);
        try {
            const gameState = await apiRequest(`get-game-state?gameId=${currentGameId}`, 'GET');
            console.log("Estado recibido:", gameState);
            currentPlayers = gameState.players || [];
            currentDebts = gameState.debts || [];
            updatePlayerList(); updateSelectOptions(); calculateDebtSummary(); updateDebtMatrix();
            if (currentPlayers.length < 2) {
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

    // Listener para Iniciar Nuevo Juego
    startGameButton.addEventListener('click', async () => {
        console.log("Botón 'Iniciar Nuevo Juego' presionado.");
        if (localStorage.getItem('currentGameId')) {
            if (!confirm('Al iniciar un juego nuevo... ¿Continuar?')) {
                console.log("Usuario canceló iniciar nuevo juego."); return;
            }
             console.log("Usuario confirmó iniciar nuevo...");
        }
        console.log("Preparando para iniciar nuevo juego...");
        currentGameId = null; resetLocalState();
        console.log("Intentando iniciar nuevo juego vía API...");
        try {
            const data = await apiRequest('start-game', 'POST');
            if (!data || !data.gameId) { throw new Error("Respuesta API inválida: no gameId."); }
            currentGameId = data.gameId;
            localStorage.setItem('currentGameId', currentGameId);
            console.log("Nuevo juego iniciado con ID:", currentGameId);
            updatePlayerList(); updateSelectOptions(); updateDebtMatrix();
            console.log("Mostrando página 'register-players-page'.");
            showPage('register-players-page'); // <-- Llamada para cambiar página
            if(playerNameInput) playerNameInput.focus();
        } catch (error) {
            console.error("****** ERROR CAPTURADO en startGameButton ******:", error);
            localStorage.removeItem('currentGameId'); currentGameId = null; resetLocalState();
            if(continueGameButton) continueGameButton.disabled = true;
            showPage('welcome-page');
        }
    });

    // Listener para Ir a Registro de Deudas
    finishRegistrationButton.addEventListener('click', () => {
         if (currentPlayers.length < 2) { alert('Debes registrar al menos dos jugadores.'); return; }
         console.log("DEBUG finishRegistration: currentPlayers:", JSON.stringify(currentPlayers));
         updateSelectOptions();
         calculateDebtSummary();
         updateDebtMatrix();
         console.log("DEBUG finishRegistration: Mostrando página deudas...");
         showPage('register-debts-page'); // <-- Llamada para cambiar página
    });
    // Listener para Agregar Más Jugadores
    addNewPlayerButton.addEventListener('click', () => {
         console.log("Mostrando página 'register-players-page' desde AddNewPlayer.");
         showPage('register-players-page'); // <-- Llamada para cambiar página
         if(playerNameInput) playerNameInput.focus();
     });

    // --- Lógica de Jugadores ---
    registerPlayerButton.addEventListener('click', async () => { /* ... código sin cambios ... */ });
    playerNameInput.addEventListener('keypress', (event) => { /* ... */ });

    // --- Lógica de Deudas ---
    registerDebtButton.addEventListener('click', async () => { /* ... código sin cambios ... */ });

    // --- Lógica de Finalización (confirm() simple) ---
    endGameButton.addEventListener('click', async () => { /* ... código sin cambios de checkpoint ... */ });

    // --- Funciones Auxiliares ---

    // --- showPage REFORZADA ---
    function showPage(pageIdToShow) {
        console.log(`--- Intentando mostrar página: ${pageIdToShow} ---`);
        const pages = document.querySelectorAll('.page');
        if (!pages || pages.length === 0) {
            console.error("Error en showPage: No se encontraron elementos .page");
            return;
        }

        let targetPageFound = false;

        // Ocultar TODAS las páginas primero
        console.log("   -> Ocultando todas las páginas (.page)...");
        pages.forEach(page => {
            // Verificar si el elemento existe antes de intentar acceder a style
            if (page && page.style) {
                 page.style.display = 'none';
            } else {
                console.warn("Elemento .page inválido encontrado durante ocultación:", page);
            }
        });

        // Luego, intentar mostrar la página deseada
        const targetPage = document.getElementById(pageIdToShow);
        if (targetPage && targetPage.classList.contains('page') && targetPage.style) {
            console.log(`   -> Mostrando página con ID: ${pageIdToShow}`);
            targetPage.style.display = 'block'; // Mostrar la página objetivo
            targetPageFound = true;
        } else {
             console.error(`   -> ¡ERROR! No se encontró o es inválido el elemento .page con ID: ${pageIdToShow}`);
             if (targetPage) console.error("      Elemento encontrado:", targetPage, "¿Tiene clase 'page'?", targetPage.classList.contains('page'));
        }

        console.log(`--- Fin de showPage para: ${pageIdToShow} (Encontrada: ${targetPageFound}) ---`);
    }
    // --- FIN showPage REFORZADA ---

    function updatePlayerList() { /* ... código sin cambios ... */ }
    function updateSelectOptions() { /* ... código sin cambios con DEBUG logs ... */ }
    function initializeDebtSummary() { /* ... código sin cambios ... */ }
    function calculateDebtSummary() { /* ... código sin cambios ... */ }
    function updateDebtMatrix() { /* ... código sin cambios ... */ }
    function resetLocalState() { /* ... código sin cambios ... */ }

    // --- Inicialización Final ---
    console.log("Inicialización JS completada. Llamando a loadExistingGame...");
    loadExistingGame();

}); // Fin del DOMContentLoaded
// ----- FIN CÓDIGO script.js COMPLETO (Checkpoint + showPage Reforzado) -----