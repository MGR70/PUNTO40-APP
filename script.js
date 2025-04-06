// ----- INICIO CÓDIGO script.js COMPLETO (con Debug Logs) -----
document.addEventListener('DOMContentLoaded', () => {
    // --- Selección de Elementos del DOM ---
    const welcomePage = document.getElementById('welcome-page');
    const registerPlayersPage = document.getElementById('register-players-page');
    const registerDebtsPage = document.getElementById('register-debts-page');
    const startGameButton = document.getElementById('start-game');
    const continueGameButton = document.getElementById('continue-game');
    const registerPlayerButton = document.getElementById('register-player');
    const finishRegistrationButton = document.getElementById('finish-registration');
    const addNewPlayerButton = document.getElementById('add-new-player');
    const registerDebtButton = document.getElementById('register-debt');
    const endGameButton = document.getElementById('end-game');
    const playerNameInput = document.getElementById('player-name');
    const playerList = document.getElementById('player-list');
    const debtorSelect = document.getElementById('debtor');
    const winnerSelect = document.getElementById('winner');
    const debtAmountInput = document.getElementById('debt-amount');
    const debtMatrixTable = document.getElementById('debt-matrix');
    const debtMatrixThead = debtMatrixTable.querySelector('thead');
    const debtMatrixTbody = debtMatrixTable.querySelector('tbody');
    const modal = document.getElementById('custom-confirm-modal');
    const modalMessage = document.getElementById('modal-message');
    const modalBtnConfirm = document.getElementById('modal-btn-confirm');
    const modalBtnAlt = document.getElementById('modal-btn-alt');
    const modalBtnCancel = document.getElementById('modal-btn-cancel');

    // --- Estado de la Aplicación ---
    let currentGameId = null;
    let currentPlayers = [];
    let currentDebts = [];
    let summary = {};
    let modalActionResolver = null;

    // --- Helper para llamadas a la API ---
    async function apiRequest(endpoint, method = 'GET', body = null) {
        const options = { method, headers: {} };
        if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }
        try {
            const response = await fetch(`/api/${endpoint}`, options);
            if (!response.ok) {
                let errorData; try { errorData = await response.json(); } catch (e) { errorData = { message: `HTTP error! status: ${response.status}` }; }
                console.error(`API Error (${response.status}) en ${endpoint}:`, errorData); throw new Error(errorData.message || `Request failed with status ${response.status}`);
            }
            if (response.status === 204) return null;
            return await response.json();
        } catch (error) {
            console.error(`Network or fetch error for endpoint ${endpoint}:`, error); alert(`Error de red o del servidor: ${error.message}. Intenta de nuevo.`); throw error;
        }
    }

    // --- Lógica del Modal Personalizado ---
    function showCustomConfirm(message, confirmText, altText, cancelText) {
        return new Promise((resolve) => {
            modalMessage.textContent = message;
            modalBtnConfirm.textContent = confirmText;
            modalBtnConfirm.style.display = confirmText ? 'inline-block' : 'none';
            modalBtnAlt.textContent = altText;
            modalBtnAlt.style.display = altText ? 'inline-block' : 'none';
            modalBtnCancel.textContent = cancelText || 'Cancelar';
            modalBtnCancel.style.display = (cancelText !== null) ? 'inline-block' : 'none';
            modal.style.display = 'flex';
            modalActionResolver = resolve;
        });
    }
    modalBtnConfirm.addEventListener('click', () => { if (modalActionResolver) modalActionResolver('confirm'); modal.style.display = 'none'; });
    modalBtnAlt.addEventListener('click', () => { if (modalActionResolver) modalActionResolver('alt'); modal.style.display = 'none'; });
    modalBtnCancel.addEventListener('click', () => { if (modalActionResolver) modalActionResolver('cancel'); modal.style.display = 'none'; });
    modal.addEventListener('click', (event) => { if (event.target === modal) { if (modalActionResolver) modalActionResolver('cancel'); modal.style.display = 'none'; } });

    // --- Lógica de Inicio y Carga del Juego ---
    function checkExistingGame() {
        const savedGameId = localStorage.getItem('currentGameId');
        if (savedGameId) {
            console.log("Juego guardado encontrado:", savedGameId);
            continueGameButton.disabled = false;
        } else {
            console.log("No se encontró juego guardado.");
            continueGameButton.disabled = true;
        }
        showPage('welcome-page'); // Mostrar siempre bienvenida al inicio
    }

    continueGameButton.addEventListener('click', () => {
        const savedGameId = localStorage.getItem('currentGameId');
        if (savedGameId && !continueGameButton.disabled) {
            console.log("Botón 'Continuar' presionado. Cargando juego ID:", savedGameId);
            currentGameId = savedGameId;
            fetchAndDisplayGameState();
        } else if (!savedGameId) {
             console.warn("Botón Continuar clickeado pero no hay ID guardado. Deshabilitando.");
             continueGameButton.disabled = true;
        }
    });

    async function fetchAndDisplayGameState() {
        if (!currentGameId) return;
        console.log("fetchAndDisplayGameState: Intentando cargar estado para ID:", currentGameId);
        try {
            const gameState = await apiRequest(`get-game-state?gameId=${currentGameId}`, 'GET');
            console.log("Estado del juego recibido:", gameState);
            currentPlayers = gameState.players || [];
            currentDebts = gameState.debts || [];
            updatePlayerList(); updateSelectOptions(); calculateDebtSummary(); updateDebtMatrix();

            // *** PUNTO CLAVE: Decidir y llamar a showPage ***
            if (currentPlayers.length === 0) {
                console.log("FetchGameState: Juego cargado sin jugadores, yendo a registro.");
                showPage('register-players-page'); // <-- LLAMADA IMPORTANTE
                if(playerNameInput) playerNameInput.focus(); // Añadido foco aquí también
            } else {
                console.log("FetchGameState: Juego cargado con jugadores, yendo a registro de deudas.");
                showPage('register-debts-page'); // <-- LLAMADA IMPORTANTE
            }
            // *** FIN PUNTO CLAVE ***

        } catch (error) {
            alert(`Error al cargar el estado del juego (ID: ${currentGameId}). Es posible que los datos se hayan corrompido o borrado.`);
            console.error("Error fetching game state:", error);
            localStorage.removeItem('currentGameId'); currentGameId = null; resetLocalState();
            continueGameButton.disabled = true;
            showPage('welcome-page');
        }
    }

    // --- Navegación entre Páginas ---

    // --- MODIFICADO CON LOGS DE DIAGNÓSTICO: startGameButton Listener ---
    startGameButton.addEventListener('click', async () => {
        // Advertir si hay un juego activo que se perderá (a menos que se guardara al finalizar)
        const potentiallyActiveGameId = localStorage.getItem('currentGameId');
        if (potentiallyActiveGameId) {
            console.log("DEBUG: Juego potencialmente activo detectado al iniciar uno nuevo.");
            if (!confirm('Parece que hay un juego guardado. Si inicias uno nuevo ahora, el progreso anterior podría perderse si no lo guardaste explícitamente al finalizar. ¿Continuar iniciando un juego nuevo?')) {
                console.log("DEBUG: Usuario canceló iniciar nuevo juego debido a advertencia.");
                return; // El usuario canceló
            }
            console.log("DEBUG: Usuario confirmó iniciar nuevo juego a pesar de la advertencia.");
        }

        // Limpiar estado local y prepararse para el nuevo juego
        console.log("DEBUG: Preparando para iniciar nuevo juego...");
        currentGameId = null;
        resetLocalState();
        continueGameButton.disabled = true;

        console.log("DEBUG: Intentando iniciar nuevo juego vía API (/api/start-game)...");
        try {
            // --- PASO 1: Llamada a la API ---
            const data = await apiRequest('start-game', 'POST');
            console.log("DEBUG: Respuesta RECIBIDA de /api/start-game:", data); // <-- LOG CLAVE

            // --- PASO 2: Extraer gameId ---
            if (!data || !data.gameId) {
                 // Si la respuesta no tiene la forma esperada, lanza un error para que lo capture el catch
                throw new Error("Respuesta de API inválida: no se recibió gameId.");
            }
            currentGameId = data.gameId;
            console.log("DEBUG: gameId extraído:", currentGameId);

            // --- PASO 3: Guardar en localStorage ---
            localStorage.setItem('currentGameId', currentGameId);
            console.log("DEBUG: gameId guardado en localStorage.");

            // --- PASO 4: Habilitar botón Continuar ---
            continueGameButton.disabled = false;
            console.log("DEBUG: Botón 'Continuar' habilitado.");

            // --- PASO 5: Actualizar UI (listas, selects, matriz) ---
            updatePlayerList();
            updateSelectOptions();
            updateDebtMatrix();
            console.log("DEBUG: UI (listas, selects, matriz) actualizada/limpiada.");

            // *** PUNTO CLAVE: Llamar a showPage al final ***
            console.log("DEBUG: Intentando mostrar página 'register-players-page'.");
            showPage('register-players-page'); // <-- LLAMADA IMPORTANTE
            console.log("DEBUG: showPage('register-players-page') ejecutado.");

            // --- PASO 6: Poner foco ---
             if (playerNameInput) {
                playerNameInput.focus();
                console.log("DEBUG: Foco puesto en playerNameInput.");
             } else {
                 console.warn("DEBUG: No se pudo encontrar playerNameInput para poner el foco.");
             }

        } catch (error) {
            // *** ESTE BLOQUE SE ESTÁ EJECUTANDO AHORA ***
            console.error("****** ERROR CAPTURADO en startGameButton ******:", error); // <-- LOG CLAVE
            localStorage.removeItem('currentGameId');
            currentGameId = null;
            resetLocalState(); // resetLocalState ya limpia la UI básica
            continueGameButton.disabled = true;
            console.log("DEBUG: Debido al error, mostrando 'welcome-page'.");
            showPage('welcome-page'); // <-- EXPLAINS WHY 'welcome-page' IS SHOWN
        }
    });
    // --- FIN MODIFICADO: startGameButton Listener ---


    finishRegistrationButton.addEventListener('click', () => { if (currentPlayers.length < 2) { alert('Debes registrar al menos dos jugadores.'); return; } showPage('register-debts-page'); updateSelectOptions(); calculateDebtSummary(); updateDebtMatrix(); });
    addNewPlayerButton.addEventListener('click', () => { showPage('register-players-page'); if(playerNameInput) playerNameInput.focus(); });

    // --- Lógica de Jugadores ---
    registerPlayerButton.addEventListener('click', async () => {
        const playerName = playerNameInput.value.trim(); if (!playerName) { alert('Por favor, introduce un nombre de jugador.'); return; } if (currentPlayers.includes(playerName)) { alert(`El jugador "${playerName}" ya ha sido registrado...`); playerNameInput.select(); return; } if (!currentGameId) { alert("Error: No hay un juego activo..."); return; }
        try {
            await apiRequest('add-player', 'POST', { gameId: currentGameId, playerName });
            currentPlayers.push(playerName); updatePlayerList(); updateSelectOptions(); calculateDebtSummary(); updateDebtMatrix();
            playerNameInput.value = ''; if(playerNameInput) playerNameInput.focus();
        } catch (error) { console.error("Falló añadir jugador:", error); if(playerNameInput) playerNameInput.select(); }
    });
    playerNameInput.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); registerPlayerButton.click(); } });

    // --- Lógica de Deudas ---
    registerDebtButton.addEventListener('click', async () => {
        const debtor = debtorSelect.value; const winner = winnerSelect.value; const amount = parseFloat(debtAmountInput.value);
        if (!debtor || !winner) { alert('Debes seleccionar deudor y acreedor.'); return; } if (debtor === winner) { alert('Deudor y acreedor iguales.'); return; } if (isNaN(amount) || amount <= 0) { alert('Monto inválido.'); if(debtAmountInput) debtAmountInput.focus(); return; } if (!currentGameId) { alert("Error: No hay juego activo..."); return; }
        try {
            await apiRequest('add-debt', 'POST', { gameId: currentGameId, debtor, winner, amount });
            currentDebts.push({ debtor, winner, amount }); calculateDebtSummary(); updateDebtMatrix();
            debtAmountInput.value = ''; if(debtAmountInput) debtAmountInput.focus();
        } catch (error) { console.error("Falló añadir deuda:", error); }
    });

    // --- Lógica de Finalización ---
    endGameButton.addEventListener('click', async () => {
        if (!currentGameId) { alert("No hay ningún juego activo para finalizar."); return; }
        console.log("Botón Finalizar Juego presionado.");
        const choice1 = await showCustomConfirm('¿Qué deseas hacer con este juego?', 'Descartar Juego (Borrar Datos)', 'Guardar y Salir', 'Volver al Juego');
        console.log("Respuesta Modal 1:", choice1);
        if (choice1 === 'alt') { // Guardar y Salir
            console.log("Eligió Guardar y Salir. Navegando a bienvenida.");
            checkExistingGame();
        } else if (choice1 === 'confirm') { // Descartar
            console.log("Eligió Descartar. Mostrando segunda confirmación.");
            const choice2 = await showCustomConfirm('¿Estás SEGURO de que quieres borrar permanentemente todos los datos de este juego?', 'Sí, Borrar Definitivamente', null, 'Cancelar');
            console.log("Respuesta Modal 2:", choice2);
            if (choice2 === 'confirm') { // Confirmó borrado
                console.log("Confirmó borrado. Llamando a API end-game...");
                try {
                    await apiRequest('end-game', 'POST', { gameId: currentGameId }); console.log("Juego borrado con éxito vía API.");
                } catch (error) { console.error("Falló la llamada a API para borrar juego:", error); }
                 // Siempre limpiar localmente después de intentar borrar
                 localStorage.removeItem('currentGameId'); currentGameId = null; resetLocalState(); continueGameButton.disabled = true; showPage('welcome-page');
            } else { console.log("Canceló el borrado definitivo. Volviendo al juego."); }
        } else { console.log("Eligió Volver al Juego o cerró el modal."); }
    });

    // --- Funciones Auxiliares ---
    function showPage(pageId) {
        console.log(`--- Intentando mostrar página: ${pageId} ---`);
        const pages = document.querySelectorAll('.page');
        console.log(`Encontrados ${pages.length} elementos con la clase 'page'.`);
        if (pages.length === 0) { console.error("¡ERROR GRAVE! No se encontraron .page"); return; }
        let foundTargetPage = false;
        pages.forEach(page => {
            if (!page.id) { console.warn("ADVERTENCIA: .page sin ID:", page); page.style.display = 'none'; return; }
            const shouldDisplay = page.id === pageId;
            console.log(`Procesando: ID="${page.id}". ¿Coincide con "${pageId}"? ${shouldDisplay}`);
            if (shouldDisplay) {
                console.log(`   -> Estableciendo display = 'block' para ID="${page.id}"`); page.style.display = 'block'; foundTargetPage = true;
            } else {
                console.log(`   -> Estableciendo display = 'none' para ID="${page.id}"`); page.style.display = 'none';
            }
        });
        if (!foundTargetPage) { console.error(`¡ERROR! No se encontró ID="${pageId}"`); }
         console.log(`--- Fin de showPage para: ${pageId} ---`);
    }

    function updatePlayerList() { playerList.innerHTML = ''; currentPlayers.forEach(player => { const li = document.createElement('li'); li.textContent = player; playerList.appendChild(li); }); }
    function updateSelectOptions() { /* ... código igual ... */ }
    function initializeDebtSummary() { /* ... código igual ... */ }
    function calculateDebtSummary() { /* ... código igual ... */ }
    function updateDebtMatrix() { /* ... código igual ... */ }
    function resetLocalState() { console.log("Reseteando estado local..."); currentPlayers = []; currentDebts = []; summary = {}; playerNameInput.value = ''; debtAmountInput.value = ''; playerList.innerHTML = ''; updateSelectOptions(); updateDebtMatrix(); }

    // --- Inicialización al cargar la página ---
    console.log("DOM Cargado. Verificando juego existente...");
    checkExistingGame();

}); // Fin del DOMContentLoaded
// ----- FIN CÓDIGO script.js COMPLETO (con Debug Logs) -----