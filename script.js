// ----- INICIO CÓDIGO script.js COMPLETO (v11 - Basado en v9 + Logs SelectOptions) -----
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando selección de elementos..."); // Log v9 OK

    // --- Selección de Elementos del DOM ---
    let criticalElementMissing = false; // Log v9 OK
    function checkElement(element, id, isCritical = true) { if (!element && isCritical) { console.error(`****** ERROR CRÍTICO: No se encontró ID="${id}" ******`); criticalElementMissing = true; } return element; } // Log v9 OK

    const welcomePage = checkElement(document.getElementById('welcome-page'), 'welcome-page'); // Log v9 OK
    const registerPlayersPage = checkElement(document.getElementById('register-players-page'), 'register-players-page'); // Log v9 OK
    const registerDebtsPage = checkElement(document.getElementById('register-debts-page'), 'register-debts-page'); // Log v9 OK
    const startGameButton = checkElement(document.getElementById('start-game'), 'start-game'); // Log v9 OK
    const continueGameButton = checkElement(document.getElementById('continue-game'), 'continue-game', false); // Log v9 OK
    const registerPlayerButton = checkElement(document.getElementById('register-player'), 'register-player'); // Log v9 OK
    const finishRegistrationButton = checkElement(document.getElementById('finish-registration'), 'finish-registration'); // Log v9 OK
    const addNewPlayerButton = checkElement(document.getElementById('add-new-player'), 'add-new-player'); // Log v9 OK
    const registerDebtButton = checkElement(document.getElementById('register-debt'), 'register-debt'); // Log v9 OK
    const endGameButton = checkElement(document.getElementById('end-game'), 'end-game'); // Log v9 OK
    const playerNameInput = checkElement(document.getElementById('player-name'), 'player-name'); // Log v9 OK
    const playerList = checkElement(document.getElementById('player-list'), 'player-list'); // Log v9 OK
    const debtorSelect = checkElement(document.getElementById('debtor'), 'debtor'); // Log v9 OK
    const winnerSelect = checkElement(document.getElementById('winner'), 'winner'); // Log v9 OK
    const debtAmountInput = checkElement(document.getElementById('debt-amount'), 'debt-amount'); // Log v9 OK
    const debtMatrixTable = checkElement(document.getElementById('debt-matrix'), 'debt-matrix'); // Log v9 OK
    const modal = checkElement(document.getElementById('custom-confirm-modal'), 'custom-confirm-modal', false); // Log v9 OK

    let debtMatrixThead = null; let debtMatrixTbody = null; // Log v9 OK
    if (debtMatrixTable) { debtMatrixThead = debtMatrixTable.querySelector('thead'); debtMatrixTbody = debtMatrixTable.querySelector('tbody'); if (!debtMatrixThead || !debtMatrixTbody) criticalElementMissing = true; } // Log v9 OK
    else { criticalElementMissing = true; } // Log v9 OK

    if (criticalElementMissing) { console.error("Inicialización detenida..."); alert("Error crítico..."); return; } // Log v9 OK
    console.log("Selección de elementos completada."); // Log v9 OK

    // --- Estado de la Aplicación ---
    let currentGameId = null; let currentPlayers = []; let currentDebts = []; let summary = {}; // Log v9 OK

    // --- Helper para llamadas a la API (Mantenemos v3 Robusta con Logs Extremos) ---
    async function apiRequest(endpoint, method = 'GET', body = null) { /* ... código igual v3 ... */ } // Log v9 OK

    // --- Lógica de Inicio y Carga (confirm()) ---
    function loadExistingGame() { // Log v9 OK
        const savedGameId = localStorage.getItem('currentGameId'); // Log v9 OK
        if (savedGameId) { // Log v9 OK
            console.log("loadExistingGame: Juego guardado encontrado:", savedGameId); // Log v9 OK
            if (confirm('¿Deseas continuar con el último juego guardado?')) { // Log v9 OK
                console.log("loadExistingGame: Usuario confirmó continuar."); // Log v9 OK
                currentGameId = savedGameId; // Log v9 OK
                fetchAndDisplayGameState(); // Log v9 OK
            } else { // Log v9 OK
                console.log("loadExistingGame: Usuario canceló continuar."); // Log v9 OK
                showPage('welcome-page'); // Log v9 OK
            } // Log v9 OK
        } else { // Log v9 OK
            console.log("loadExistingGame: No se encontró juego guardado."); // Log v9 OK
            showPage('welcome-page'); // Log v9 OK
        } // Log v9 OK
         if (continueGameButton) { // Log v9 OK
             continueGameButton.disabled = !savedGameId; // Log v9 OK
             console.log(`loadExistingGame: Botón Continuar ${savedGameId ? 'HABILITADO' : 'DESHABILITADO'}.`); // Log v9 OK
         } // Log v9 OK
    } // Log v9 OK

    // Función para cargar datos
    async function fetchAndDisplayGameState() { // Log v9 OK
        if (!currentGameId) { console.error("fetchAndDisplayGameState: llamado sin currentGameId!"); return; } // Log v9 OK
        console.log("fetchAndDisplayGameState: Cargando ID:", currentGameId); // Log v9 OK
        try { // Log v9 OK
            const gameState = await apiRequest(`get-game-state?gameId=${currentGameId}`, 'GET'); // Log v9 OK
            console.log("fetchAndDisplayGameState: Estado recibido:", gameState); // Log v9 OK
            currentPlayers = gameState.players || []; // Log v9 OK
            currentDebts = gameState.debts || []; // Log v9 OK
            updatePlayerList(); updateSelectOptions(); calculateDebtSummary(); updateDebtMatrix(); // Log v9 OK
            if (currentPlayers.length < 2) { // Log v9 OK
                 console.log("fetchAndDisplayGameState: Juego cargado tiene < 2 jugadores..."); // Log v9 OK
                 showPage('register-players-page'); if(playerNameInput) playerNameInput.focus(); // Log v9 OK
            } else { // Log v9 OK
                 console.log("fetchAndDisplayGameState: Juego cargado OK. Yendo a deudas."); // Log v9 OK
                 showPage('register-debts-page'); // Log v9 OK
            } // Log v9 OK
        } catch (error) { // Log v9 OK
            alert(`Error al cargar estado del juego (ID: ${currentGameId}).`); // Log v9 OK
            console.error("fetchAndDisplayGameState: Error fetching game state:", error); // Log v9 OK
            localStorage.removeItem('currentGameId'); currentGameId = null; resetLocalState(); // Log v9 OK
             if(continueGameButton) continueGameButton.disabled = true; // Log v9 OK
            showPage('welcome-page'); // Log v9 OK
        } // Log v9 OK
    } // Log v9 OK

    // --- Navegación entre Páginas ---

    // Listener para Iniciar Nuevo Juego (El que funcionaba en v9)
    startGameButton.addEventListener('click', async () => { // Log v9 OK
        console.log("startGameButton: Botón presionado."); // Log v9 OK
        if (localStorage.getItem('currentGameId')) { // Log v9 OK
            if (!confirm('Al iniciar un juego nuevo... ¿Continuar?')) { // Log v9 OK
                console.log("startGameButton: Usuario canceló iniciar nuevo."); return; // Log v9 OK
            } // Log v9 OK
             console.log("startGameButton: Usuario confirmó iniciar nuevo..."); // Log v9 OK
        } // Log v9 OK
        console.log("startGameButton: Preparando..."); // Log v9 OK
        currentGameId = null; resetLocalState(); // Log v9 OK
        if (continueGameButton) continueGameButton.disabled = true; // Log v9 OK

        console.log("startGameButton: Intentando API /api/start-game..."); // Log v9 OK
        try { // Log v9 OK
            const data = await apiRequest('start-game', 'POST'); // Log v9 OK
            if (!data || !data.gameId) { throw new Error("Respuesta API inválida: no gameId."); } // Log v9 OK
            currentGameId = data.gameId; // Log v9 OK
            localStorage.setItem('currentGameId', currentGameId); // Log v9 OK
            console.log("startGameButton: Nuevo juego iniciado con ID:", currentGameId); // Log v9 OK

            if (continueGameButton) continueGameButton.disabled = false; // Log v9 OK

            updatePlayerList(); updateSelectOptions(); updateDebtMatrix(); // Log v9 OK
            console.log("startGameButton: UI reseteada."); // Log v9 OK
            console.log("startGameButton: Mostrando 'register-players-page'."); // Log v9 OK
            showPage('register-players-page'); // Log v9 OK
            if(playerNameInput) playerNameInput.focus(); // Log v9 OK
        } catch (error) { // Log v9 OK
            console.error("startGameButton: ****** ERROR CAPTURADO ******:", error); // Log v9 OK
            localStorage.removeItem('currentGameId'); currentGameId = null; resetLocalState(); // Log v9 OK
            if(continueGameButton) continueGameButton.disabled = true; // Log v9 OK
            showPage('welcome-page'); // Log v9 OK
        } // Log v9 OK
    }); // Log v9 OK

    // Listener para Ir a Registro de Deudas
    finishRegistrationButton.addEventListener('click', () => { // Log v9 OK
         if (currentPlayers.length < 2) { alert('Debes registrar al menos dos jugadores.'); return; } // Log v9 OK
         console.log("finishRegistrationButton: currentPlayers:", JSON.stringify(currentPlayers)); // Log v9 OK
         updateSelectOptions(); // <-- Llamada clave
         calculateDebtSummary(); // Log v9 OK
         updateDebtMatrix(); // Log v9 OK
         console.log("finishRegistrationButton: Mostrando página deudas..."); // Log v9 OK
         showPage('register-debts-page'); // Log v9 OK
    }); // Log v9 OK

    // Listener para Agregar Más Jugadores
    addNewPlayerButton.addEventListener('click', () => { // Log v9 OK
         console.log("addNewPlayerButton: Mostrando 'register-players-page'."); // Log v9 OK
         showPage('register-players-page'); // Log v9 OK
         if(playerNameInput) playerNameInput.focus(); // Log v9 OK
     }); // Log v9 OK

    // --- Lógica de Jugadores (con DEBUG Logs) ---
    registerPlayerButton.addEventListener('click', async () => { // Log v9 OK
        console.log("DEBUG RegisterPlayer: Botón presionado."); // Log v9 OK
        const playerName = playerNameInput.value.trim(); // Log v9 OK
        console.log(`DEBUG RegisterPlayer: Nombre obtenido: "${playerName}"`); // Log v9 OK
        if (!playerName) { alert('Nombre vacío.'); console.log("DEBUG RegisterPlayer: Nombre vacío."); return; } // Log v9 OK
        if (currentPlayers.includes(playerName)) { alert(`Jugador "${playerName}" duplicado.`); console.log(`DEBUG RegisterPlayer: Jugador duplicado.`); if(playerNameInput) playerNameInput.select(); return; } // Log v9 OK
        if (!currentGameId) { alert("Error: No hay juego activo."); console.error("DEBUG RegisterPlayer: currentGameId es null."); return; } // Log v9 OK

        console.log(`DEBUG RegisterPlayer: Validaciones OK. Intentando API /api/add-player para ${currentGameId}...`); // Log v9 OK
        try { // Log v9 OK
            const responseData = await apiRequest('add-player', 'POST', { gameId: currentGameId, playerName }); // Log v9 OK
            console.log("DEBUG RegisterPlayer: API /api/add-player completada:", responseData); // Log v9 OK
            console.log(`DEBUG RegisterPlayer: Añadiendo "${playerName}" a currentPlayers local.`); // Log v9 OK
            currentPlayers.push(playerName); // Log v9 OK
            console.log("DEBUG RegisterPlayer: Actualizando UI..."); // Log v9 OK
            updatePlayerList(); // Log v9 OK
            updateSelectOptions(); // Log v9 OK
            calculateDebtSummary(); // Log v9 OK
            updateDebtMatrix(); // Log v9 OK
            console.log("DEBUG RegisterPlayer: Limpiando input..."); // Log v9 OK
            if (playerNameInput) { playerNameInput.value = ''; playerNameInput.focus(); } // Log v9 OK
            console.log("DEBUG RegisterPlayer: Proceso completado."); // Log v9 OK
        } catch (error) { // Log v9 OK
            console.error("****** ERROR CAPTURADO en registerPlayerButton ******:", error); // Log v9 OK
            if(playerNameInput) playerNameInput.select(); // Log v9 OK
        } // Log v9 OK
    }); // Log v9 OK
    // --- FIN Lógica de Jugadores ---

    playerNameInput.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); registerPlayerButton.click(); } }); // Log v9 OK

    // --- Lógica de Deudas ---
    registerDebtButton.addEventListener('click', async () => { /* ... código sin cambios ... */ }); // Log v9 OK

    // --- Lógica de Finalización (confirm() simple) ---
    endGameButton.addEventListener('click', async () => { /* ... código sin cambios de checkpoint ... */ }); // Log v9 OK

    // --- Funciones Auxiliares ---
    function showPage(pageIdToShow) { // Log v9 OK (Versión Reforzada)
        console.log(`--- Intentando mostrar página: ${pageIdToShow} ---`); // Log v9 OK
        const pages = document.querySelectorAll('.page'); // Log v9 OK
        if (!pages || pages.length === 0) { console.error("Error en showPage: No .page"); return; } // Log v9 OK
        let targetPageFound = false; // Log v9 OK
        console.log("   -> Ocultando todas las páginas (.page)..."); // Log v9 OK
        pages.forEach(page => { if (page && page.style) page.style.display = 'none'; else console.warn("Elemento .page inválido:", page); }); // Log v9 OK
        const targetPage = document.getElementById(pageIdToShow); // Log v9 OK
        if (targetPage && targetPage.classList.contains('page') && targetPage.style) { // Log v9 OK
            console.log(`   -> Mostrando página con ID: ${pageIdToShow}`); targetPage.style.display = 'block'; targetPageFound = true; // Log v9 OK
        } else { console.error(`   -> ¡ERROR! No se encontró/inválido .page con ID: ${pageIdToShow}`); if (targetPage) console.error("      Elemento:", targetPage); } // Log v9 OK
        console.log(`--- Fin de showPage para: ${pageIdToShow} (Encontrada: ${targetPageFound}) ---`); // Log v9 OK
    } // Log v9 OK

    function updatePlayerList() { /* ... código sin cambios ... */ } // Log v9 OK

    // --- updateSelectOptions CON LOGS DETALLADOS --- (Añadido de v10 a v9)
    function updateSelectOptions() {
        if (!debtorSelect || !winnerSelect) { console.error("ERROR en updateSelectOptions: Selects no encontrados!"); return; } // Log v10
        const currentDebtor = debtorSelect.value; // Log v10
        const currentWinner = winnerSelect.value; // Log v10
        debtorSelect.innerHTML = ''; // Log v10
        winnerSelect.innerHTML = ''; // Log v10
        const defaultOption = document.createElement('option'); // Log v10
        defaultOption.value = ""; // Log v10
        defaultOption.textContent = "-- Selecciona Jugador --"; // Log v10
        defaultOption.disabled = true; // Log v10
        debtorSelect.appendChild(defaultOption.cloneNode(true)); // Log v10
        winnerSelect.appendChild(defaultOption.cloneNode(true)); // Log v10
        console.log(`DEBUG updateSelectOptions: Iniciando. currentPlayers (${currentPlayers.length}):`, JSON.stringify(currentPlayers)); // Log v10
        currentPlayers.forEach((player, index) => { // Log v10
            console.log(`DEBUG updateSelectOptions: [${index}] Añadiendo opción para: ${player}`); // Log v10
            try { // Log v10
                const option = document.createElement('option'); // Log v10
                option.value = player; // Log v10
                option.textContent = player; // Log v10
                debtorSelect.appendChild(option.cloneNode(true)); // Log v10
                winnerSelect.appendChild(option.cloneNode(true)); // Log v10
                 console.log(`DEBUG updateSelectOptions: [${index}] Opción para ${player} añadida OK.`); // Log v10
            } catch (error) { console.error(`DEBUG updateSelectOptions: [${index}] ERROR al añadir opción para ${player}:`, error); } // Log v10
        }); // Log v10
        console.log(`DEBUG updateSelectOptions: Bucle completado. Restaurando selección...`); // Log v10
        try { // Log v10
            if (currentPlayers.length > 0) { debtorSelect.value = currentPlayers.includes(currentDebtor) ? currentDebtor : ""; winnerSelect.value = currentPlayers.includes(currentWinner) ? currentWinner : ""; } // Log v10
            else { debtorSelect.value = ""; winnerSelect.value = ""; } // Log v10
            if (!debtorSelect.value) debtorSelect.value = ""; if (!winnerSelect.value) winnerSelect.value = ""; // Log v10
             console.log(`DEBUG updateSelectOptions: Selección restaurada (debtor: '${debtorSelect.value}', winner: '${winnerSelect.value}').`); // Log v10
        } catch (error) { console.error("DEBUG updateSelectOptions: Error al restaurar selección:", error); } // Log v10
        console.log("DEBUG updateSelectOptions: Finalizado."); // Log v10
    }
    // --- FIN updateSelectOptions ---

    function initializeDebtSummary() { /* ... código sin cambios ... */ } // Log v9 OK
    function calculateDebtSummary() { /* ... código sin cambios ... */ } // Log v9 OK
    function updateDebtMatrix() { /* ... código sin cambios ... */ } // Log v9 OK
    function resetLocalState() { /* ... código sin cambios ... */ } // Log v9 OK

    // --- Inicialización Final ---
    console.log("Inicialización JS completada. Llamando a loadExistingGame..."); // Log v9 OK
    loadExistingGame(); // Log v9 OK

}); // Fin del DOMContentLoaded // Log v9 OK
// ----- FIN CÓDIGO script.js COMPLETO (v11 - Basado en v9 + Logs SelectOptions) -----