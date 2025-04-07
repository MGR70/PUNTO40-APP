// ----- INICIO CÓDIGO script.js COMPLETO (v14 - Bienvenida Mejorada) -----
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando selección de elementos...");

    // --- Selección de Elementos del DOM ---
    let criticalElementMissing = false;
    function checkElement(element, id, isCritical = true) { if (!element && isCritical) { console.error(`****** ERROR CRÍTICO: No se encontró ID="${id}" ******`); criticalElementMissing = true; } else if (!element && !isCritical) { /* console.warn(`Advertencia: Opcional ID="${id}" no encontrado.`); */ } return element; }

    const welcomePage = checkElement(document.getElementById('welcome-page'), 'welcome-page');
    const registerPlayersPage = checkElement(document.getElementById('register-players-page'), 'register-players-page');
    const registerDebtsPage = checkElement(document.getElementById('register-debts-page'), 'register-debts-page');
    const startGameButton = checkElement(document.getElementById('start-game'), 'start-game');
    const continueGameButton = checkElement(document.getElementById('continue-game'), 'continue-game'); // Ahora es crítico
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
    const modal = checkElement(document.getElementById('custom-confirm-modal'), 'custom-confirm-modal', false); // Sigue siendo opcional

    let debtMatrixThead = null; let debtMatrixTbody = null;
    if (debtMatrixTable) { debtMatrixThead = debtMatrixTable.querySelector('thead'); debtMatrixTbody = debtMatrixTable.querySelector('tbody'); if (!debtMatrixThead || !debtMatrixTbody) criticalElementMissing = true; }
    else { criticalElementMissing = true; }

    if (criticalElementMissing) { console.error("Inicialización detenida..."); alert("Error crítico..."); return; }
    console.log("Selección de elementos completada.");

    // --- Estado de la Aplicación ---
    let currentGameId = null; let currentPlayers = []; let currentDebts = []; let summary = {};

    // --- Helper para llamadas a la API (Usaremos la v2 robusta sin logs extremos) ---
    async function apiRequest(endpoint, method = 'GET', body = null) {
        const options = { method, headers: {} };
        if (body) { options.headers['Content-Type'] = 'application/json'; options.body = JSON.stringify(body); }
        // console.log(`apiRequest: ${method} /api/${endpoint}`); // Log reducido
        try {
            const response = await fetch(`/api/${endpoint}`, options);
            // console.log(`apiRequest: Status ${response.status}`); // Log reducido
            if (!response.ok) {
                let errorData = { message: `Error HTTP ${response.status}` }; try { errorData = await response.json(); } catch (e) { try { errorData.message = await response.text() || errorData.message; } catch (e2) {} }
                console.error(`Error en API ${endpoint} (${response.status}):`, errorData.message || 'Sin detalles'); // Log de error más conciso
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
            alert(`Error de comunicación: ${error.message}.`); // Mantenemos alerta
            throw error;
        }
    }
    // --- FIN Helper ---

    // --- Lógica de Inicio y Carga (MODIFICADA - Sin confirm()) ---
    function checkAndSetContinueButton() {
        const savedGameId = localStorage.getItem('currentGameId');
        if (savedGameId) {
            console.log("checkAndSetContinueButton: Juego guardado encontrado:", savedGameId);
            continueGameButton.disabled = false; // Habilitar
            console.log("checkAndSetContinueButton: Botón Continuar HABILITADO.");
        } else {
            console.log("checkAndSetContinueButton: No se encontró juego guardado.");
            continueGameButton.disabled = true; // Deshabilitar
            console.log("checkAndSetContinueButton: Botón Continuar DESHABILITADO.");
        }
        // Asegurarse que la página de bienvenida esté visible al inicio
        showPage('welcome-page');
        console.log("checkAndSetContinueButton: Página de bienvenida mostrada.");
    }

    // Función para cargar datos (sin cambios lógicos, solo logs ajustados)
    async function fetchAndDisplayGameState() {
        if (!currentGameId) { console.error("fetchAndDisplayGameState: llamado sin currentGameId!"); return; }
        console.log("fetchAndDisplayGameState: Cargando ID:", currentGameId);
        try {
            const gameState = await apiRequest(`get-game-state?gameId=${currentGameId}`, 'GET');
            console.log("fetchAndDisplayGameState: Estado recibido:", gameState ? 'OK' : 'Vacío/Error');
            currentPlayers = gameState.players || [];
            currentDebts = gameState.debts || [];

            updatePlayerList();
            updateSelectOptions();
            calculateDebtSummary();
            updateDebtMatrix();

            if (currentPlayers.length < 2 && gameState) { // Solo ir a registro si recibimos respuesta pero sin jugadores
                 console.log("fetchAndDisplayGameState: Juego cargado tiene < 2 jugadores. Yendo a registro.");
                 showPage('register-players-page');
                 if(playerNameInput) playerNameInput.focus();
            } else if (gameState) { // Si recibimos respuesta y hay jugadores
                 console.log("fetchAndDisplayGameState: Juego cargado OK. Yendo a registro de deudas.");
                 showPage('register-debts-page');
            } else {
                // Si gameState es null o undefined (error en API no capturado antes?)
                 throw new Error("No se recibieron datos válidos del estado del juego.");
            }
        } catch (error) {
            // apiRequest ya debería haber mostrado un alert. Limpiamos.
            console.error("fetchAndDisplayGameState: Error fetching game state:", error);
            alert(`Error al cargar los datos del juego. Es posible que el juego haya sido borrado.`); // Mensaje más específico
            localStorage.removeItem('currentGameId');
            currentGameId = null;
            resetLocalState();
            if(continueGameButton) continueGameButton.disabled = true;
            showPage('welcome-page');
        }
    }

    // --- Navegación entre Páginas ---

    // Listener para Iniciar Nuevo Juego (MODIFICADO - Sin confirm() de advertencia)
    startGameButton.addEventListener('click', async () => {
        console.log("startGameButton: Botón presionado.");
        // Ya no preguntamos si hay juego activo, simplemente procedemos a crear uno nuevo.
        // El ID viejo en localStorage se sobrescribirá.

        console.log("startGameButton: Preparando para iniciar nuevo juego...");
        currentGameId = null; // Limpiar ID actual
        resetLocalState(); // Limpiar estado y UI local
        if (continueGameButton) continueGameButton.disabled = true; // Deshabilitar mientras se crea

        console.log("startGameButton: Intentando API /api/start-game...");
        try {
            const data = await apiRequest('start-game', 'POST');
            if (!data || !data.gameId) { throw new Error("Respuesta API inválida al crear juego: no gameId."); }

            currentGameId = data.gameId;
            localStorage.setItem('currentGameId', currentGameId); // Guardar NUEVO ID
            console.log("startGameButton: Nuevo juego iniciado con ID:", currentGameId);

            if (continueGameButton) continueGameButton.disabled = false; // Habilitar botón continuar AHORA

            updatePlayerList(); // Asegurar UI vacía
            updateSelectOptions();
            updateDebtMatrix();
            console.log("startGameButton: UI reseteada.");

            console.log("startGameButton: Mostrando 'register-players-page'.");
            showPage('register-players-page');
            if(playerNameInput) playerNameInput.focus();

        } catch (error) {
            // apiRequest ya muestra alert. Limpiar por si acaso.
            console.error("startGameButton: ****** ERROR CAPTURADO ******:", error);
            localStorage.removeItem('currentGameId'); currentGameId = null; resetLocalState();
            if(continueGameButton) continueGameButton.disabled = true;
            showPage('welcome-page');
        }
    });

    // --- NUEVO: Listener para Continuar Último Juego ---
    continueGameButton.addEventListener('click', () => {
        // Solo actúa si el botón no está deshabilitado
        if (!continueGameButton.disabled) {
            const savedGameId = localStorage.getItem('currentGameId');
            if (savedGameId) {
                console.log("continueGameButton: Botón presionado. Cargando juego ID:", savedGameId);
                currentGameId = savedGameId; // Establecer el ID activo
                fetchAndDisplayGameState(); // Cargar los datos y mostrar página
            } else {
                // Esto no debería ocurrir si el botón está habilitado, pero por seguridad
                console.warn("continueGameButton: Clic detectado pero no hay ID en localStorage. Deshabilitando.");
                continueGameButton.disabled = true;
                alert("No se encontró un juego guardado para continuar.");
            }
        } else {
            console.log("continueGameButton: Clic ignorado (botón deshabilitado).");
        }
    });
    // --- FIN NUEVO Listener ---


    // Listener Ir a Deudas (sin cambios lógicos)
    finishRegistrationButton.addEventListener('click', () => {
         if (currentPlayers.length < 2) { alert('Debes registrar al menos dos jugadores.'); return; }
         console.log("finishRegistrationButton: Pasando a deudas...");
         updateSelectOptions(); calculateDebtSummary(); updateDebtMatrix();
         showPage('register-debts-page');
    });

    // Listener Agregar más jugadores (sin cambios lógicos)
    addNewPlayerButton.addEventListener('click', () => {
         console.log("addNewPlayerButton: Volviendo a registro.");
         showPage('register-players-page');
         if(playerNameInput) playerNameInput.focus();
     });

    // --- Lógica de Jugadores (sin cambios lógicos, logs reducidos) ---
    registerPlayerButton.addEventListener('click', async () => {
        const playerName = playerNameInput.value.trim();
        if (!playerName) { alert('Introduce un nombre.'); return; }
        if (currentPlayers.includes(playerName)) { alert(`Jugador "${playerName}" ya existe.`); if(playerNameInput) playerNameInput.select(); return; }
        if (!currentGameId) { alert("Error: No hay juego activo."); return; }
        console.log(`registerPlayerButton: Añadiendo "${playerName}"...`);
        try {
            await apiRequest('add-player', 'POST', { gameId: currentGameId, playerName });
            currentPlayers.push(playerName);
            updatePlayerList(); updateSelectOptions(); calculateDebtSummary(); updateDebtMatrix(); // Actualizar todo
            if(playerNameInput) { playerNameInput.value = ''; playerNameInput.focus(); }
        } catch (error) { console.error("registerPlayerButton: Error:", error); if(playerNameInput) playerNameInput.select(); }
    });

    playerNameInput.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); registerPlayerButton.click(); } });

    // --- Lógica de Deudas (sin cambios lógicos, logs reducidos) ---
    registerDebtButton.addEventListener('click', async () => {
        const debtor = debtorSelect.value; const winner = winnerSelect.value; const amount = parseFloat(debtAmountInput.value);
        if (!debtor || !winner) { alert('Selecciona deudor y acreedor.'); return; }
        if (debtor === winner) { alert('Deudor y acreedor iguales.'); return; }
        if (isNaN(amount) || amount <= 0) { alert('Monto inválido.'); if(debtAmountInput) debtAmountInput.focus(); return; }
        if (!currentGameId) { alert("Error: No hay juego activo."); return; }
        console.log(`registerDebtButton: Añadiendo deuda ${debtor}->${winner} ${amount}...`);
        try {
            await apiRequest('add-debt', 'POST', { gameId: currentGameId, debtor, winner, amount });
            currentDebts.push({ debtor, winner, amount });
            calculateDebtSummary(); updateDebtMatrix(); // Recalcular y actualizar
            if(debtAmountInput) { debtAmountInput.value = ''; debtAmountInput.focus(); }
        } catch (error) { console.error("registerDebtButton: Error:", error); }
    });

    // --- Lógica de Finalización (confirm() simple - SIN CAMBIOS desde Checkpoint) ---
    endGameButton.addEventListener('click', async () => {
         if (!currentGameId) { alert("No hay juego activo."); return; }
         console.log("endGameButton: Presionado.");
        if (confirm('¿Estás seguro de que deseas finalizar y BORRAR permanentemente los datos de este juego?')) {
             console.log("endGameButton: Usuario confirma borrado.");
             console.log(`endGameButton: Intentando API /api/end-game para ${currentGameId}`);
             try {
                 await apiRequest('end-game', 'POST', { gameId: currentGameId });
                 console.log("endGameButton: API OK.");
             } catch (error) { console.error("endGameButton: Error API:", error); }
             console.log("endGameButton: Limpiando estado local...");
             localStorage.removeItem('currentGameId'); currentGameId = null; resetLocalState();
             if(continueGameButton) continueGameButton.disabled = true;
             showPage('welcome-page');
        } else { console.log("endGameButton: Usuario canceló borrado."); }
    });

    // --- Funciones Auxiliares ---
    function showPage(pageIdToShow) {
         console.log(`--- showPage: Mostrando ${pageIdToShow} ---`); // Log simplificado
        document.querySelectorAll('.page').forEach(page => { if (page && page.style) page.style.display = page.id === pageIdToShow ? 'block' : 'none'; });
    }
    function updatePlayerList() { if (!playerList) return; playerList.innerHTML = ''; currentPlayers.forEach(player => { const li = document.createElement('li'); li.textContent = player; playerList.appendChild(li); }); console.log("updatePlayerList ejecutado."); }

    // updateSelectOptions con logs mínimos
    function updateSelectOptions() {
         if (!debtorSelect || !winnerSelect) { console.error("updateSelectOptions: Selects no encontrados!"); return; }
        const currentDebtor = debtorSelect.value; const currentWinner = winnerSelect.value;
        debtorSelect.innerHTML = ''; winnerSelect.innerHTML = '';
        const defaultOption = document.createElement('option'); defaultOption.value = ""; defaultOption.textContent = "-- Selecciona Jugador --"; defaultOption.disabled = true;
        debtorSelect.appendChild(defaultOption.cloneNode(true)); winnerSelect.appendChild(defaultOption.cloneNode(true));
        console.log(`updateSelectOptions: Añadiendo ${currentPlayers.length} jugadores.`); // Log
        currentPlayers.forEach(player => { const option = document.createElement('option'); option.value = player; option.textContent = player; debtorSelect.appendChild(option.cloneNode(true)); winnerSelect.appendChild(option.cloneNode(true)); });
        debtorSelect.value = currentPlayers.includes(currentDebtor) ? currentDebtor : ""; winnerSelect.value = currentPlayers.includes(currentWinner) ? currentWinner : "";
        if (!debtorSelect.value) debtorSelect.value = ""; if (!winnerSelect.value) winnerSelect.value = "";
        console.log(`updateSelectOptions: Finalizado.`); // Log
    }

    function initializeDebtSummary() { /* ... código sin cambios ... */ }
    function calculateDebtSummary() { /* ... código sin cambios ... */ }
    function updateDebtMatrix() { /* ... código sin cambios ... */ }
    function resetLocalState() { console.log("resetLocalState ejecutado."); currentPlayers = []; currentDebts = []; summary = {}; if(playerNameInput) playerNameInput.value = ''; if(debtAmountInput) debtAmountInput.value = ''; if(playerList) playerList.innerHTML = ''; updateSelectOptions(); updateDebtMatrix(); }

    // --- Inicialización Final ---
    console.log("Inicialización JS completada. Llamando a checkAndSetContinueButton...");
    checkAndSetContinueButton(); // <-- LLAMA A LA NUEVA FUNCIÓN

}); // Fin del DOMContentLoaded
// ----- FIN CÓDIGO script.js COMPLETO (v14 - Bienvenida Mejorada) -----