// ----- INICIO CÓDIGO script.js COMPLETO (v14 - Bienvenida Mejorada - RESTAURADA) -----
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando selección de elementos...");

    // --- Selección de Elementos del DOM ---
    let criticalElementMissing = false;
    function checkElement(element, id, isCritical = true) { if (!element && isCritical) { console.error(`****** ERROR CRÍTICO: No se encontró ID="${id}" ******`); criticalElementMissing = true; } else if (!element && !isCritical) { /* console.warn(`Advertencia: Opcional ID="${id}" no encontrado.`); */ } return element; }

    const welcomePage = checkElement(document.getElementById('welcome-page'), 'welcome-page');
    const registerPlayersPage = checkElement(document.getElementById('register-players-page'), 'register-players-page');
    const registerDebtsPage = checkElement(document.getElementById('register-debts-page'), 'register-debts-page');
    const startGameButton = checkElement(document.getElementById('start-game'), 'start-game');
    const continueGameButton = checkElement(document.getElementById('continue-game'), 'continue-game'); // Esencial
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

    // --- Helper para llamadas a la API (v2 Robusta - Sin Logs Extremos) ---
    async function apiRequest(endpoint, method = 'GET', body = null) {
        const options = { method, headers: {} };
        if (body) { options.headers['Content-Type'] = 'application/json'; options.body = JSON.stringify(body); }
        // console.log(`apiRequest: ${method} /api/${endpoint}`); // Log Mínimo
        try {
            const response = await fetch(`/api/${endpoint}`, options);
            // console.log(`apiRequest: Status ${response.status}`); // Log Mínimo
            if (!response.ok) {
                let errorData = { message: `Error HTTP ${response.status}` }; try { errorData = await response.json(); } catch (e) { try { errorData.message = await response.text() || errorData.message; } catch (e2) {} }
                console.error(`Error en API ${endpoint} (${response.status}):`, errorData.message || 'Sin detalles');
                throw new Error(errorData.message || `Request failed with status ${response.status}`);
            }
            if (response.status === 204) return null;
            try {
                const data = await response.json(); return data;
            } catch (e) {
                 console.error(`Error al parsear JSON (${response.status}) desde /api/${endpoint}:`, e);
                 throw new Error(`Respuesta inesperada del servidor.`);
            }
        } catch (error) {
            console.error(`Error en apiRequest para ${endpoint}:`, error);
            alert(`Error de comunicación: ${error.message}.`);
            throw error;
        }
    }
    // --- FIN Helper ---

    // --- Lógica de Inicio y Carga (MODIFICADA - Sin confirm()) ---
    function checkAndSetContinueButton() {
        const savedGameId = localStorage.getItem('currentGameId');
        if (savedGameId) {
            // console.log("checkAndSetContinueButton: Juego guardado encontrado:", savedGameId); // Log reducido
            if (continueGameButton) continueGameButton.disabled = false; // Habilitar
        } else {
            // console.log("checkAndSetContinueButton: No se encontró juego guardado."); // Log reducido
            if (continueGameButton) continueGameButton.disabled = true; // Deshabilitar
        }
        showPage('welcome-page');
        // console.log("checkAndSetContinueButton: Página de bienvenida mostrada."); // Log reducido
    }

    // Función para cargar datos
    async function fetchAndDisplayGameState() {
        if (!currentGameId) { console.error("fetchAndDisplayGameState: llamado sin currentGameId!"); return; }
        console.log("fetchAndDisplayGameState: Cargando ID:", currentGameId);
        try {
            const gameState = await apiRequest(`get-game-state?gameId=${currentGameId}`, 'GET');
            // console.log("fetchAndDisplayGameState: Estado recibido:", gameState ? 'OK' : 'Vacío/Error'); // Log reducido
            currentPlayers = gameState.players || [];
            currentDebts = gameState.debts || [];
            updatePlayerList(); updateSelectOptions(); calculateDebtSummary(); updateDebtMatrix();
            if (currentPlayers.length < 2 && gameState) {
                 // console.log("fetchAndDisplayGameState: Juego cargado tiene < 2 jugadores."); // Log reducido
                 showPage('register-players-page'); if(playerNameInput) playerNameInput.focus();
            } else if (gameState) {
                 // console.log("fetchAndDisplayGameState: Juego cargado OK."); // Log reducido
                 showPage('register-debts-page');
            } else { throw new Error("No se recibieron datos válidos."); }
        } catch (error) {
            console.error("fetchAndDisplayGameState: Error fetching state:", error);
            alert(`Error al cargar datos del juego.`);
            localStorage.removeItem('currentGameId'); currentGameId = null; resetLocalState();
            if(continueGameButton) continueGameButton.disabled = true;
            showPage('welcome-page');
        }
    }

    // --- Navegación entre Páginas ---

    // Listener para Iniciar Nuevo Juego (MODIFICADO - Sin confirm() de advertencia)
    startGameButton.addEventListener('click', async () => {
        // console.log("startGameButton: Botón presionado."); // Log reducido
        console.log("startGameButton: Preparando para iniciar nuevo juego...");
        currentGameId = null; resetLocalState();
        if (continueGameButton) continueGameButton.disabled = true;

        // console.log("startGameButton: Intentando API /api/start-game..."); // Log reducido
        try {
            const data = await apiRequest('start-game', 'POST');
            if (!data || !data.gameId) { throw new Error("Respuesta API inválida: no gameId."); }
            currentGameId = data.gameId;
            localStorage.setItem('currentGameId', currentGameId);
            console.log("startGameButton: Nuevo juego iniciado con ID:", currentGameId); // Log importante
            if (continueGameButton) continueGameButton.disabled = false;
            updatePlayerList(); updateSelectOptions(); updateDebtMatrix();
            // console.log("startGameButton: UI reseteada."); // Log reducido
            showPage('register-players-page');
            if(playerNameInput) playerNameInput.focus();
        } catch (error) {
            console.error("startGameButton: ****** ERROR CAPTURADO ******:", error);
            localStorage.removeItem('currentGameId'); currentGameId = null; resetLocalState();
            if(continueGameButton) continueGameButton.disabled = true;
            showPage('welcome-page');
        }
    });

    // --- NUEVO: Listener para Continuar Último Juego ---
    if (continueGameButton) { // Añadir solo si el botón existe
        continueGameButton.addEventListener('click', () => {
            if (!continueGameButton.disabled) {
                const savedGameId = localStorage.getItem('currentGameId');
                if (savedGameId) {
                    console.log("continueGameButton: Cargando juego ID:", savedGameId);
                    currentGameId = savedGameId;
                    fetchAndDisplayGameState();
                } else {
                     console.warn("continueGameButton: Clic pero no hay ID.");
                     continueGameButton.disabled = true;
                     alert("No se encontró juego para continuar.");
                }
            } else { /* console.log("continueGameButton: Clic ignorado (deshabilitado)."); */ } // Log reducido
        });
    }
    // --- FIN NUEVO Listener ---

    // Listener Ir a Deudas
    finishRegistrationButton.addEventListener('click', () => {
         if (currentPlayers.length < 2) { alert('Debes registrar al menos dos jugadores.'); return; }
         console.log("finishRegistrationButton: Pasando a deudas. Jugadores:", JSON.stringify(currentPlayers)); // Log importante
         updateSelectOptions(); // <-- Llamada Clave
         calculateDebtSummary();
         updateDebtMatrix();
         showPage('register-debts-page');
    });

    // Listener Agregar más jugadores
    addNewPlayerButton.addEventListener('click', () => {
         showPage('register-players-page');
         if(playerNameInput) playerNameInput.focus();
     });

    // --- Lógica de Jugadores ---
    registerPlayerButton.addEventListener('click', async () => {
        const playerName = playerNameInput.value.trim();
        if (!playerName) { alert('Introduce un nombre.'); return; }
        if (currentPlayers.includes(playerName)) { alert(`Jugador "${playerName}" ya existe.`); if(playerNameInput) playerNameInput.select(); return; }
        if (!currentGameId) { alert("Error: No hay juego activo."); return; }
        // console.log(`registerPlayerButton: Añadiendo "${playerName}"...`); // Log reducido
        try {
            await apiRequest('add-player', 'POST', { gameId: currentGameId, playerName });
            currentPlayers.push(playerName);
            updatePlayerList(); updateSelectOptions(); calculateDebtSummary(); updateDebtMatrix();
            if(playerNameInput) { playerNameInput.value = ''; playerNameInput.focus(); }
        } catch (error) { console.error("registerPlayerButton: Error:", error); if(playerNameInput) playerNameInput.select(); }
    });

    playerNameInput.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); registerPlayerButton.click(); } });

    // --- Lógica de Deudas ---
    registerDebtButton.addEventListener('click', async () => {
        const debtor = debtorSelect.value; const winner = winnerSelect.value; const amount = parseFloat(debtAmountInput.value);
        if (!debtor || !winner) { alert('Selecciona deudor y acreedor.'); return; }
        if (debtor === winner) { alert('Deudor y acreedor iguales.'); return; }
        if (isNaN(amount) || amount <= 0) { alert('Monto inválido.'); if(debtAmountInput) debtAmountInput.focus(); return; }
        if (!currentGameId) { alert("Error: No hay juego activo."); return; }
        // console.log(`registerDebtButton: Añadiendo deuda...`); // Log reducido
        try {
            await apiRequest('add-debt', 'POST', { gameId: currentGameId, debtor, winner, amount });
            currentDebts.push({ debtor, winner, amount });
            calculateDebtSummary(); updateDebtMatrix();
            if(debtAmountInput) { debtAmountInput.value = ''; debtAmountInput.focus(); }
        } catch (error) { console.error("registerDebtButton: Error:", error); }
    });

    // --- Lógica de Finalización (confirm() simple - Checkpoint) ---
    endGameButton.addEventListener('click', async () => {
         if (!currentGameId) { alert("No hay juego activo."); return; }
        // console.log("endGameButton: Presionado."); // Log reducido
        console.log(`endGameButton: ID del juego a finalizar: ${currentGameId}`);
        if (confirm('¿Estás seguro de que deseas finalizar y BORRAR permanentemente los datos de este juego?')) {
             // console.log("endGameButton: Usuario confirma borrado."); // Log reducido
             try {
                 await apiRequest('end-game', 'POST', { gameId: currentGameId });
             } catch (error) { console.error("endGameButton: Error API (puede ser normal si ya no existe):", error); }
             localStorage.removeItem('currentGameId'); currentGameId = null; resetLocalState();
             if(continueGameButton) continueGameButton.disabled = true;
             showPage('welcome-page');
        } else { /* console.log("endGameButton: Usuario canceló borrado."); */ } // Log reducido
    });

    // --- Funciones Auxiliares ---
    function showPage(pageIdToShow) {
        // console.log(`--- showPage: Mostrando ${pageIdToShow} ---`); // Log reducido
        document.querySelectorAll('.page').forEach(page => { if (page && page.style) page.style.display = page.id === pageIdToShow ? 'block' : 'none'; });
    }
    function updatePlayerList() { if (!playerList) return; playerList.innerHTML = ''; currentPlayers.forEach(player => { const li = document.createElement('li'); li.textContent = player; playerList.appendChild(li); }); }
    function updateSelectOptions() {
         if (!debtorSelect || !winnerSelect) { console.error("updateSelectOptions: Selects no encontrados!"); return; }
        const currentDebtor = debtorSelect.value; const currentWinner = winnerSelect.value;
        debtorSelect.innerHTML = ''; winnerSelect.innerHTML = '';
        const defaultOption = document.createElement('option'); defaultOption.value = ""; defaultOption.textContent = "-- Selecciona Jugador --"; defaultOption.disabled = true;
        debtorSelect.appendChild(defaultOption.cloneNode(true)); winnerSelect.appendChild(defaultOption.cloneNode(true));
        // console.log(`updateSelectOptions: Añadiendo ${currentPlayers.length} jugadores.`); // Log reducido
        currentPlayers.forEach(player => { const option = document.createElement('option'); option.value = player; option.textContent = player; debtorSelect.appendChild(option.cloneNode(true)); winnerSelect.appendChild(option.cloneNode(true)); });
        debtorSelect.value = currentPlayers.includes(currentDebtor) ? currentDebtor : ""; winnerSelect.value = currentPlayers.includes(currentWinner) ? currentWinner : "";
        if (!debtorSelect.value) debtorSelect.value = ""; if (!winnerSelect.value) winnerSelect.value = "";
        // console.log(`updateSelectOptions: Finalizado.`); // Log reducido
    }
    function initializeDebtSummary() { summary = {}; currentPlayers.forEach(p1 => { summary[p1] = {}; currentPlayers.forEach(p2 => { if (p1 !== p2) summary[p1][p2] = 0; }); }); }
    function calculateDebtSummary() { initializeDebtSummary(); let grossDebts = {}; currentPlayers.forEach(p1 => { grossDebts[p1] = {}; currentPlayers.forEach(p2 => { if (p1 !== p2) grossDebts[p1][p2] = 0; }); }); currentDebts.forEach(debt => { if (grossDebts[debt.debtor] && grossDebts[debt.debtor].hasOwnProperty(debt.winner)) { grossDebts[debt.debtor][debt.winner] += Number(debt.amount) || 0; } }); currentPlayers.forEach(p1 => { currentPlayers.forEach(p2 => { if (p1 === p2) return; const amountP1toP2 = grossDebts[p1]?.[p2] || 0; const amountP2toP1 = grossDebts[p2]?.[p1] || 0; const netDifference = amountP1toP2 - amountP2toP1; if (netDifference > 0) { summary[p1][p2] = netDifference; if (summary[p2]) summary[p2][p1] = 0; } else { summary[p1][p2] = 0; } }); }); }
    function updateDebtMatrix() { if (!debtMatrixThead || !debtMatrixTbody) return; debtMatrixThead.innerHTML = ''; debtMatrixTbody.innerHTML = ''; if (currentPlayers.length === 0) return; const headerRow = debtMatrixThead.insertRow(); const cornerTh = document.createElement('th'); cornerTh.innerHTML = 'Deudor ↓ / Acreedor →'; headerRow.appendChild(cornerTh); currentPlayers.forEach(player => { const th = document.createElement('th'); th.textContent = player; headerRow.appendChild(th); }); currentPlayers.forEach(debtor => { const row = debtMatrixTbody.insertRow(); const debtorHeaderCell = document.createElement('th'); debtorHeaderCell.textContent = debtor; row.appendChild(debtorHeaderCell); currentPlayers.forEach(winner => { const cell = row.insertCell(); if (debtor === winner) { cell.textContent = '-'; cell.className = 'diagonal'; } else { const netDebt = summary[debtor]?.[winner] || 0; cell.textContent = netDebt > 0 ? netDebt.toFixed(2) : ''; cell.className = netDebt > 0 ? 'has-debt' : 'no-debt'; } }); }); }
    function resetLocalState() { console.log("resetLocalState ejecutado."); currentPlayers = []; currentDebts = []; summary = {}; if(playerNameInput) playerNameInput.value = ''; if(debtAmountInput) debtAmountInput.value = ''; if(playerList) playerList.innerHTML = ''; updateSelectOptions(); updateDebtMatrix(); }

    // --- Inicialización Final ---
    console.log("Inicialización JS v14 (Bienvenida Mejorada) completada. Llamando a checkAndSetContinueButton...");
    checkAndSetContinueButton(); // Llama a la función de bienvenida mejorada

}); // Fin del DOMContentLoaded
// ----- FIN CÓDIGO script.js COMPLETO (v14 - Restaurada) -----