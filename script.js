// ----- INICIO CÓDIGO script.js COMPLETO (v15 - Diagnóstico UI Deudas) -----
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando selección de elementos...");

    // --- Selección de Elementos del DOM ---
    let criticalElementMissing = false;
    function checkElement(element, id, isCritical = true) { if (!element && isCritical) { console.error(`****** ERROR CRÍTICO: No se encontró ID="${id}" ******`); criticalElementMissing = true; } else if (!element && !isCritical) { /* console.warn(`Advertencia: Opcional ID="${id}" no encontrado.`); */ } return element; }

    const welcomePage = checkElement(document.getElementById('welcome-page'), 'welcome-page');
    const registerPlayersPage = checkElement(document.getElementById('register-players-page'), 'register-players-page');
    const registerDebtsPage = checkElement(document.getElementById('register-debts-page'), 'register-debts-page');
    const startGameButton = checkElement(document.getElementById('start-game'), 'start-game');
    const continueGameButton = checkElement(document.getElementById('continue-game'), 'continue-game'); // Esencial para la nueva lógica
    const registerPlayerButton = checkElement(document.getElementById('register-player'), 'register-player');
    const finishRegistrationButton = checkElement(document.getElementById('finish-registration'), 'finish-registration');
    const addNewPlayerButton = checkElement(document.getElementById('add-new-player'), 'add-new-player');
    const registerDebtButton = checkElement(document.getElementById('register-debt'), 'register-debt');
    const endGameButton = checkElement(document.getElementById('end-game'), 'end-game');
    const playerNameInput = checkElement(document.getElementById('player-name'), 'player-name');
    const playerList = checkElement(document.getElementById('player-list'), 'player-list');
    const debtorSelect = checkElement(document.getElementById('debtor'), 'debtor');     // <-- VERIFICAR
    const winnerSelect = checkElement(document.getElementById('winner'), 'winner');     // <-- VERIFICAR
    const debtAmountInput = checkElement(document.getElementById('debt-amount'), 'debt-amount');
    const debtMatrixTable = checkElement(document.getElementById('debt-matrix'), 'debt-matrix'); // <-- VERIFICAR TABLA
    const modal = checkElement(document.getElementById('custom-confirm-modal'), 'custom-confirm-modal', false);

    let debtMatrixThead = null; let debtMatrixTbody = null; // <-- VERIFICAR thead/tbody
    if (debtMatrixTable) {
        debtMatrixThead = debtMatrixTable.querySelector('thead');
        debtMatrixTbody = debtMatrixTable.querySelector('tbody');
        if (!debtMatrixThead) { console.error("Error: No <thead> en #debt-matrix"); criticalElementMissing = true; }
        if (!debtMatrixTbody) { console.error("Error: No <tbody> en #debt-matrix"); criticalElementMissing = true; }
    } else { criticalElementMissing = true; }

    // *** NUEVO: Logs para verificar elementos de UI de Deudas ***
    console.log("VERIFICACIÓN Elementos UI Deudas:");
    console.log("  - debtorSelect:", debtorSelect ? 'Encontrado' : 'NO ENCONTRADO');
    console.log("  - winnerSelect:", winnerSelect ? 'Encontrado' : 'NO ENCONTRADO');
    console.log("  - debtMatrixThead:", debtMatrixThead ? 'Encontrado' : 'NO ENCONTRADO');
    console.log("  - debtMatrixTbody:", debtMatrixTbody ? 'Encontrado' : 'NO ENCONTRADO');
    // *** FIN NUEVO ***

    if (criticalElementMissing) { console.error("Inicialización detenida..."); alert("Error crítico..."); return; }
    console.log("Selección de elementos completada.");

    // --- Estado de la Aplicación ---
    let currentGameId = null; let currentPlayers = []; let currentDebts = []; let summary = {};

    // --- Helper para llamadas a la API (v2 Robusta - Sin Logs Extremos) ---
    async function apiRequest(endpoint, method = 'GET', body = null) { /* ... código igual v14 ... */ }

    // --- Lógica de Inicio y Carga (Mejorada - Sin confirm()) ---
    function checkAndSetContinueButton() { /* ... código igual v14 ... */ }
    async function fetchAndDisplayGameState() { /* ... código igual v14 ... */ }

    // --- Navegación entre Páginas ---
    startGameButton.addEventListener('click', async () => { /* ... código igual v14 ... */ });
    continueGameButton.addEventListener('click', () => { /* ... código igual v14 ... */ });

    // --- Listener Ir a Deudas (MODIFICADO con setTimeout) ---
    finishRegistrationButton.addEventListener('click', () => {
         if (currentPlayers.length < 2) { alert('Debes registrar al menos dos jugadores.'); return; }
         console.log("finishRegistrationButton: Pasando a deudas. Jugadores:", JSON.stringify(currentPlayers));

         // 1. Calcular datos PRIMERO (puede que no sea necesario si ya se hizo al registrar)
         calculateDebtSummary(); // Asegurar que 'summary' esté listo

         // 2. Mostrar la página
         console.log("finishRegistrationButton: Mostrando página register-debts-page...");
         showPage('register-debts-page');

         // 3. INTENTAR actualizar la UI DESPUÉS de un breve retraso
         console.log("finishRegistrationButton: Programando actualización de UI de deudas (selects y matriz) con retraso...");
         setTimeout(() => {
             console.log("====> Ejecutando actualización de UI RETRASADA <====");
             updateSelectOptions();
             updateDebtMatrix();
             console.log("====> Fin actualización RETRASADA <====");
         }, 100); // 100 milisegundos de retraso (ajustable)

    });
    // --- FIN Listener Ir a Deudas ---


    addNewPlayerButton.addEventListener('click', () => { /* ... código igual v14 ... */ });

    // --- Lógica de Jugadores ---
    // Asegurarse que registerPlayer llama a updateSelectOptions y updateDebtMatrix
    registerPlayerButton.addEventListener('click', async () => {
        const playerName = playerNameInput.value.trim();
        if (!playerName) { alert('Introduce un nombre.'); return; }
        if (currentPlayers.includes(playerName)) { alert(`Jugador "${playerName}" ya existe.`); if(playerNameInput) playerNameInput.select(); return; }
        if (!currentGameId) { alert("Error: No hay juego activo."); return; }
        console.log(`registerPlayerButton: Añadiendo "${playerName}"...`);
        try {
            await apiRequest('add-player', 'POST', { gameId: currentGameId, playerName });
            currentPlayers.push(playerName);
            updatePlayerList();
            updateSelectOptions(); // <--- Asegurar que se llama aquí
            calculateDebtSummary();
            updateDebtMatrix(); // <--- Asegurar que se llama aquí
            if(playerNameInput) { playerNameInput.value = ''; playerNameInput.focus(); }
        } catch (error) { console.error("registerPlayerButton: Error:", error); if(playerNameInput) playerNameInput.select(); }
    });
    playerNameInput.addEventListener('keypress', (event) => { /* ... código igual v14 ... */ });

    // --- Lógica de Deudas ---
    // Asegurarse que registerDebt llama a calculate y updateDebtMatrix
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
            calculateDebtSummary(); // <--- Asegurar que se llama aquí
            updateDebtMatrix(); // <--- Asegurar que se llama aquí
            if(debtAmountInput) { debtAmountInput.value = ''; debtAmountInput.focus(); }
        } catch (error) { console.error("registerDebtButton: Error:", error); }
    });

    // --- Lógica de Finalización (confirm() simple - SIN CAMBIOS desde Checkpoint) ---
    endGameButton.addEventListener('click', async () => { /* ... código igual v14 ... */ });

    // --- Funciones Auxiliares ---
    function showPage(pageIdToShow) { /* ... código igual v14 ... */ }
    function updatePlayerList() { /* ... código igual v14 ... */ }
    // Mantener logs en updateSelectOptions
    function updateSelectOptions() {
        if (!debtorSelect || !winnerSelect) { console.error("ERROR en updateSelectOptions: Selects no encontrados!"); return; }
        const currentDebtor = debtorSelect.value; const currentWinner = winnerSelect.value;
        debtorSelect.innerHTML = ''; winnerSelect.innerHTML = '';
        const defaultOption = document.createElement('option'); defaultOption.value = ""; defaultOption.textContent = "-- Selecciona Jugador --"; defaultOption.disabled = true;
        debtorSelect.appendChild(defaultOption.cloneNode(true)); winnerSelect.appendChild(defaultOption.cloneNode(true));
        console.log(`DEBUG updateSelectOptions: Iniciando. currentPlayers (${currentPlayers.length}):`, JSON.stringify(currentPlayers));
        currentPlayers.forEach((player, index) => {
            console.log(`DEBUG updateSelectOptions: [${index}] Añadiendo opción para: ${player}`);
            try {
                const option = document.createElement('option'); option.value = player; option.textContent = player;
                debtorSelect.appendChild(option.cloneNode(true)); winnerSelect.appendChild(option.cloneNode(true));
                // console.log(`DEBUG updateSelectOptions: [${index}] Opción para ${player} añadida OK.`); // Log opcional
            } catch (error) { console.error(`DEBUG updateSelectOptions: [${index}] ERROR al añadir opción para ${player}:`, error); }
        });
        console.log(`DEBUG updateSelectOptions: Bucle completado. Restaurando selección...`);
        try {
            if (currentPlayers.length > 0) { debtorSelect.value = currentPlayers.includes(currentDebtor) ? currentDebtor : ""; winnerSelect.value = currentPlayers.includes(currentWinner) ? currentWinner : ""; }
            else { debtorSelect.value = ""; winnerSelect.value = ""; }
            if (!debtorSelect.value) debtorSelect.value = ""; if (!winnerSelect.value) winnerSelect.value = "";
             console.log(`DEBUG updateSelectOptions: Selección restaurada (debtor: '${debtorSelect.value}', winner: '${winnerSelect.value}').`);
        } catch (error) { console.error("DEBUG updateSelectOptions: Error al restaurar selección:", error); }
        console.log("DEBUG updateSelectOptions: Finalizado.");
    }

    function initializeDebtSummary() { /* ... código igual v14 ... */ }
    function calculateDebtSummary() { /* ... código igual v14 ... */ }
    // Añadir log a updateDebtMatrix
    function updateDebtMatrix() {
         if (!debtMatrixThead || !debtMatrixTbody) { console.error("updateDebtMatrix: falta thead o tbody!"); return; }
        debtMatrixThead.innerHTML = ''; debtMatrixTbody.innerHTML = '';
        if (currentPlayers.length === 0) { console.log("updateDebtMatrix: No hay jugadores, tabla vacía."); return; }
        console.log("updateDebtMatrix: Actualizando tabla con jugadores:", JSON.stringify(currentPlayers), "y resumen:", JSON.stringify(summary)); // Log
        const headerRow = debtMatrixThead.insertRow(); const cornerTh = document.createElement('th'); cornerTh.innerHTML = 'Deudor ↓ / Acreedor →'; headerRow.appendChild(cornerTh);
        currentPlayers.forEach(player => { const th = document.createElement('th'); th.textContent = player; headerRow.appendChild(th); });
        currentPlayers.forEach(debtor => {
            const row = debtMatrixTbody.insertRow(); const debtorHeaderCell = document.createElement('th'); debtorHeaderCell.textContent = debtor; row.appendChild(debtorHeaderCell);
            currentPlayers.forEach(winner => {
                const cell = row.insertCell();
                if (debtor === winner) { cell.textContent = '-'; cell.className = 'diagonal'; }
                else { const netDebt = summary[debtor]?.[winner] || 0; cell.textContent = netDebt > 0 ? netDebt.toFixed(2) : ''; cell.className = netDebt > 0 ? 'has-debt' : 'no-debt'; }
            });
        });
         console.log("updateDebtMatrix ejecutado.");
    }

    function resetLocalState() { /* ... código igual v14 ... */ }

    // --- Inicialización Final ---
    console.log("Inicialización JS completada. Llamando a checkAndSetContinueButton...");
    checkAndSetContinueButton();

}); // Fin del DOMContentLoaded
// ----- FIN CÓDIGO script.js COMPLETO (v15 - Diagnóstico UI Deudas) -----