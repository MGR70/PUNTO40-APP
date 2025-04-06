document.addEventListener('DOMContentLoaded', () => {
    // --- Selección de Elementos del DOM ---
    const welcomePage = document.getElementById('welcome-page');
    const registerPlayersPage = document.getElementById('register-players-page');
    const registerDebtsPage = document.getElementById('register-debts-page');
    const startGameButton = document.getElementById('start-game');
    const continueGameButton = document.getElementById('continue-game'); // Botón Continuar
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

    // Elementos del Modal Personalizado
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
    let modalActionResolver = null; // Para manejar la respuesta del modal

    // --- Helper para llamadas a la API (sin cambios) ---
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

            // Configurar botones y hacerlos visibles/invisibles según necesidad
            modalBtnConfirm.textContent = confirmText;
            modalBtnConfirm.style.display = confirmText ? 'inline-block' : 'none';

            modalBtnAlt.textContent = altText;
            modalBtnAlt.style.display = altText ? 'inline-block' : 'none';

            modalBtnCancel.textContent = cancelText || 'Cancelar'; // Texto por defecto
            modalBtnCancel.style.display = (cancelText !== null) ? 'inline-block' : 'none'; // Ocultar si cancelText es null

            modal.style.display = 'flex'; // Mostrar modal

            // Guardar la función 'resolve' para llamarla cuando se pulse un botón
            modalActionResolver = resolve;
        });
    }

    // Añadir listeners a los botones del modal UNA SOLA VEZ
    modalBtnConfirm.addEventListener('click', () => {
        if (modalActionResolver) modalActionResolver('confirm');
        modal.style.display = 'none';
    });
    modalBtnAlt.addEventListener('click', () => {
        if (modalActionResolver) modalActionResolver('alt');
        modal.style.display = 'none';
    });
    modalBtnCancel.addEventListener('click', () => {
        if (modalActionResolver) modalActionResolver('cancel');
        modal.style.display = 'none';
    });
    // Opcional: cerrar modal si se hace clic fuera del contenido
    modal.addEventListener('click', (event) => {
         if (event.target === modal) { // Si se hizo clic en el fondo oscuro
             if (modalActionResolver) modalActionResolver('cancel'); // Tratar como cancelación
             modal.style.display = 'none';
         }
    });


    // --- Lógica de Inicio y Carga del Juego ---

    // Verifica localStorage y habilita/deshabilita el botón "Continuar"
    function checkExistingGame() {
        const savedGameId = localStorage.getItem('currentGameId');
        if (savedGameId) {
            console.log("Juego guardado encontrado:", savedGameId);
            continueGameButton.disabled = false; // Habilitar botón
        } else {
            console.log("No se encontró juego guardado.");
            continueGameButton.disabled = true; // Deshabilitar botón
        }
        // Siempre mostrar bienvenida al inicio
        showPage('welcome-page');
    }

    // --- NUEVO: Event Listener para el botón "Continuar Último Juego" ---
    continueGameButton.addEventListener('click', () => {
        // Solo debería ser clickeable si está habilitado, pero doble chequeo
        const savedGameId = localStorage.getItem('currentGameId');
        if (savedGameId && !continueGameButton.disabled) {
            console.log("Botón 'Continuar' presionado. Cargando juego ID:", savedGameId);
            currentGameId = savedGameId;
            fetchAndDisplayGameState(); // Carga datos y muestra página de deudas
        } else if (!savedGameId) {
             console.warn("Botón Continuar clickeado pero no hay ID guardado. Deshabilitando.");
             continueGameButton.disabled = true; // Deshabilitar por si acaso
        }
    });

    // Obtiene jugadores y deudas del backend y actualiza la UI (sin cambios lógicos internos)
    async function fetchAndDisplayGameState() {
        if (!currentGameId) return;
        console.log("fetchAndDisplayGameState: Intentando cargar estado para ID:", currentGameId);
        try {
            const gameState = await apiRequest(`get-game-state?gameId=${currentGameId}`, 'GET');
            console.log("Estado del juego recibido:", gameState);
            currentPlayers = gameState.players || [];
            currentDebts = gameState.debts || [];
            updatePlayerList(); updateSelectOptions(); calculateDebtSummary(); updateDebtMatrix();
            if (currentPlayers.length === 0) {
                 showPage('register-players-page'); playerNameInput.focus();
            } else {
                 showPage('register-debts-page');
            }
        } catch (error) {
            alert(`Error al cargar el estado del juego (ID: ${currentGameId}). Es posible que los datos se hayan corrompido o borrado.`);
            console.error("Error fetching game state:", error);
            localStorage.removeItem('currentGameId'); currentGameId = null; resetLocalState();
            continueGameButton.disabled = true; // Deshabilitar botón
            showPage('welcome-page');
        }
    }

    // --- Navegación entre Páginas ---

    // --- MODIFICADO: startGameButton Listener ---
    startGameButton.addEventListener('click', async () => {
        // Advertir si hay un juego activo que se perderá (a menos que se guardara al finalizar)
        const potentiallyActiveGameId = localStorage.getItem('currentGameId');
        if (potentiallyActiveGameId) {
            console.log("Juego potencialmente activo detectado al iniciar uno nuevo.");
            // Usamos confirm normal aquí, es una advertencia simple
            if (!confirm('Parece que hay un juego guardado. Si inicias uno nuevo ahora, el progreso anterior podría perderse si no lo guardaste explícitamente al finalizar. ¿Continuar iniciando un juego nuevo?')) {
                console.log("Usuario canceló iniciar nuevo juego debido a advertencia.");
                return; // El usuario canceló
            }
            console.log("Usuario confirmó iniciar nuevo juego a pesar de la advertencia.");
            // No necesitamos borrar el juego anterior aquí, iniciar uno nuevo lo reemplazará en localStorage
            // y el viejo quedará 'huérfano' en la BD hasta que se borre explícitamente.
        }

        // Limpiar estado local y prepararse para el nuevo juego
        console.log("Preparando para iniciar nuevo juego...");
        currentGameId = null; // Asegura que no usemos un ID viejo
        resetLocalState(); // Limpia jugadores, deudas, UI local
        continueGameButton.disabled = true; // Deshabilitar mientras se crea el nuevo

        console.log("Intentando iniciar nuevo juego vía API...");
        try {
            const data = await apiRequest('start-game', 'POST');
            currentGameId = data.gameId;
            localStorage.setItem('currentGameId', currentGameId); // Guarda el NUEVO ID
            console.log("Nuevo juego iniciado con ID:", currentGameId);

            // Habilitar botón continuar ahora que tenemos un ID válido
            continueGameButton.disabled = false;

            // Actualizar UI para el nuevo juego vacío (resetLocalState ya limpió parte)
            updatePlayerList(); updateSelectOptions(); updateDebtMatrix();

            showPage('register-players-page');
            playerNameInput.focus();
        } catch (error) {
            console.error("Falló la creación de un nuevo juego vía API:", error);
            localStorage.removeItem('currentGameId'); // Limpiar si falló la creación
            currentGameId = null;
            resetLocalState();
            continueGameButton.disabled = true;
            showPage('welcome-page');
        }
    });
    // --- FIN MODIFICADO: startGameButton Listener ---

    // finishRegistrationButton y addNewPlayerButton sin cambios lógicos
    finishRegistrationButton.addEventListener('click', () => { if (currentPlayers.length < 2) { alert('Debes registrar al menos dos jugadores.'); return; } showPage('register-debts-page'); updateSelectOptions(); calculateDebtSummary(); updateDebtMatrix(); });
    addNewPlayerButton.addEventListener('click', () => { showPage('register-players-page'); playerNameInput.focus(); });

    // --- Lógica de Jugadores (sin cambios lógicos) ---
    registerPlayerButton.addEventListener('click', async () => {
        const playerName = playerNameInput.value.trim(); if (!playerName) { alert('Por favor, introduce un nombre de jugador.'); return; } if (currentPlayers.includes(playerName)) { alert(`El jugador "${playerName}" ya ha sido registrado...`); playerNameInput.select(); return; } if (!currentGameId) { alert("Error: No hay un juego activo..."); return; }
        try {
            await apiRequest('add-player', 'POST', { gameId: currentGameId, playerName });
            currentPlayers.push(playerName); updatePlayerList(); updateSelectOptions(); calculateDebtSummary(); updateDebtMatrix();
            playerNameInput.value = ''; playerNameInput.focus();
        } catch (error) { console.error("Falló añadir jugador:", error); playerNameInput.select(); }
    });
    playerNameInput.addEventListener('keypress', (event) => { if (event.key === 'Enter') { event.preventDefault(); registerPlayerButton.click(); } });

    // --- Lógica de Deudas (sin cambios lógicos) ---
    registerDebtButton.addEventListener('click', async () => {
        const debtor = debtorSelect.value; const winner = winnerSelect.value; const amount = parseFloat(debtAmountInput.value);
        if (!debtor || !winner) { alert('Debes seleccionar deudor y acreedor.'); return; } if (debtor === winner) { alert('Deudor y acreedor iguales.'); return; } if (isNaN(amount) || amount <= 0) { alert('Monto inválido.'); debtAmountInput.focus(); return; } if (!currentGameId) { alert("Error: No hay juego activo..."); return; }
        try {
            await apiRequest('add-debt', 'POST', { gameId: currentGameId, debtor, winner, amount });
            currentDebts.push({ debtor, winner, amount }); calculateDebtSummary(); updateDebtMatrix();
            debtAmountInput.value = ''; debtAmountInput.focus();
        } catch (error) { console.error("Falló añadir deuda:", error); }
    });

    // --- Lógica de Finalización ---

    // --- MODIFICADO: endGameButton Listener usa el modal ---
    endGameButton.addEventListener('click', async () => {
        if (!currentGameId) {
            alert("No hay ningún juego activo para finalizar.");
            return;
        }
        console.log("Botón Finalizar Juego presionado.");

        // Primera Pregunta usando el modal
        const choice1 = await showCustomConfirm(
            '¿Qué deseas hacer con este juego?',
            'Descartar Juego (Borrar Datos)', // Botón Confirm (rojo)
            'Guardar y Salir',                // Botón Alt (verde)
            'Volver al Juego'                 // Botón Cancel (gris)
        );

        console.log("Respuesta Modal 1:", choice1);

        if (choice1 === 'alt') { // Eligió "Guardar y Salir"
            console.log("Eligió Guardar y Salir. Navegando a bienvenida.");
            // Simplemente ir a bienvenida, el juego ya está guardado en BD y localStorage
            checkExistingGame(); // Llama a esta para asegurar estado del botón Continuar y mostrar bienvenida
            // showPage('welcome-page'); // checkExistingGame ya lo hace
        } else if (choice1 === 'confirm') { // Eligió "Descartar Juego (Borrar Datos)"
            console.log("Eligió Descartar. Mostrando segunda confirmación.");
            // Segunda Pregunta (confirmación de borrado)
            const choice2 = await showCustomConfirm(
                '¿Estás SEGURO de que quieres borrar permanentemente todos los datos de este juego?',
                'Sí, Borrar Definitivamente', // Botón Confirm (rojo)
                null,                         // Sin botón Alt
                'Cancelar'                    // Botón Cancel (gris)
            );

            console.log("Respuesta Modal 2:", choice2);

            if (choice2 === 'confirm') { // Confirmó el borrado definitivo
                console.log("Confirmó borrado. Llamando a API end-game...");
                try {
                    await apiRequest('end-game', 'POST', { gameId: currentGameId });
                    console.log("Juego borrado con éxito vía API.");
                    localStorage.removeItem('currentGameId');
                    currentGameId = null;
                    resetLocalState();
                    continueGameButton.disabled = true; // Deshabilitar botón
                    showPage('welcome-page');
                } catch (error) {
                    console.error("Falló la llamada a API para borrar juego:", error);
                    // Aunque falle API, limpiamos localmente por si acaso
                    localStorage.removeItem('currentGameId');
                    currentGameId = null;
                    resetLocalState();
                    continueGameButton.disabled = true;
                    showPage('welcome-page');
                }
            } else { // Canceló el borrado definitivo
                console.log("Canceló el borrado definitivo. Volviendo al juego.");
                // No hacer nada, permanece en la página de deudas
            }
        } else { // Eligió "Volver al Juego" o cerró el modal
            console.log("Eligió Volver al Juego o cerró el modal.");
            // No hacer nada, permanece en la página de deudas
        }
    });
    // --- FIN MODIFICADO: endGameButton Listener ---

    // --- Funciones Auxiliares ---
    function showPage(pageId) { /* ... (sin cambios) ... */ }
    function updatePlayerList() { /* ... (sin cambios) ... */ }
    function updateSelectOptions() { /* ... (sin cambios, ya se mostró antes) ... */ }
    function initializeDebtSummary() { /* ... (sin cambios) ... */ }
    function calculateDebtSummary() { /* ... (sin cambios, ya se mostró antes) ... */ }
    function updateDebtMatrix() { /* ... (sin cambios, ya se mostró antes) ... */ }

    /** Reinicia el estado local (variables JS), EXCEPTO currentGameId */
    function resetLocalState() {
        console.log("Reseteando estado local (jugadores, deudas, summary)");
        currentPlayers = []; currentDebts = []; summary = {};
        playerNameInput.value = ''; debtAmountInput.value = '';
        playerList.innerHTML = '';
        updateSelectOptions(); updateDebtMatrix(); // Limpiar UI relacionada
    }

    // --- Inicialización al cargar la página ---
    console.log("DOM Cargado. Verificando juego existente...");
    checkExistingGame(); // Llama a la función que habilita/deshabilita el botón

}); // Fin del DOMContentLoaded