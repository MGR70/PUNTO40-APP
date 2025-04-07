// ----- INICIO CÓDIGO script.js COMPLETO (v13 - Checkpoint Funcional) -----
document.addEventListener('DOMContentLoaded', () => {
    // --- Selección de Elementos del DOM ---
    const welcomePage = document.getElementById('welcome-page');
    const registerPlayersPage = document.getElementById('register-players-page');
    const registerDebtsPage = document.getElementById('register-debts-page');
    const startGameButton = document.getElementById('start-game');
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
    // Añadir verificación para thead y tbody
    let debtMatrixThead = null;
    let debtMatrixTbody = null;
    if(debtMatrixTable) {
        debtMatrixThead = debtMatrixTable.querySelector('thead');
        debtMatrixTbody = debtMatrixTable.querySelector('tbody');
    } else {
        console.error("Error Crítico: No se encontró la tabla #debt-matrix.");
        // Podríamos querer detener la ejecución aquí si la tabla es esencial desde el inicio
    }
    // Verificar que thead y tbody fueron encontrados si la tabla existía
    if(debtMatrixTable && (!debtMatrixThead || !debtMatrixTbody)) {
         console.error("Error Crítico: Falta <thead> o <tbody> dentro de #debt-matrix.");
    }


    // --- Estado de la Aplicación ---
    let currentGameId = null; // Guarda el ID del juego activo
    let currentPlayers = []; // Caché local de jugadores del juego actual
    let currentDebts = [];   // Caché local de deudas del juego actual
    let summary = {}; // Resumen de deudas (calculado localmente como antes)

    // --- Helper para llamadas a la API (Versión Inicial Robusta) ---
    async function apiRequest(endpoint, method = 'GET', body = null) {
        const options = { method, headers: {} };
        if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }
        // Log mínimo para saber qué se llama
        console.log(`apiRequest: ${method} /api/${endpoint}`);
        try {
            const response = await fetch(`/api/${endpoint}`, options);
             console.log(`apiRequest: Status ${response.status} recibido para /api/${endpoint}`);

            if (!response.ok) {
                let errorData = { message: `Error HTTP ${response.status}` };
                try {
                    errorData = await response.json();
                    console.error(`API Error Body (${response.status}) en ${endpoint}:`, errorData);
                } catch (e) {
                     try {
                         const errorText = await response.text();
                         console.error(`API Error Text (${response.status}) en ${endpoint}: ${errorText}`);
                         errorData.message = errorText || errorData.message;
                    } catch (e2) {
                         console.error(`API Error (${response.status}) en ${endpoint}: No se pudo leer cuerpo del error.`);
                    }
                }
                throw new Error(errorData.message || `Request failed with status ${response.status}`);
            }

            if (response.status === 204) { return null; }

            // Intentar leer JSON, manejar error si falla
            try {
                 const data = await response.json();
                 console.log(`apiRequest: JSON recibido OK para /api/${endpoint}:`, data);
                 return data;
            } catch(e) {
                 console.error(`Error al parsear JSON (${response.status}) desde /api/${endpoint}:`, e);
                 throw new Error(`Respuesta inesperada del servidor (no JSON).`);
            }

        } catch (error) {
            console.error(`Network or fetch error for endpoint ${endpoint}:`, error);
            alert(`Error de comunicación con el servidor: ${error.message}. Intenta de nuevo.`);
            throw error;
        }
    }


    // --- Lógica de Inicio y Carga del Juego (Usando confirm()) ---
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
                // No borramos el ID aquí, sólo mostramos bienvenida.
                // Se borrará si el usuario inicia uno nuevo explícitamente.
                showPage('welcome-page');
            }
        } else {
             console.log("loadExistingGame: No se encontró juego guardado.");
            showPage('welcome-page');
        }
         // Deshabilitar botón continuar (si existe en HTML) basado en ID guardado
         // Aunque no le hayamos añadido listener en esta versión.
        const continueBtn = document.getElementById('continue-game');
        if (continueBtn) continueBtn.disabled = !savedGameId;
    }

    // Obtiene jugadores y deudas del backend y actualiza la UI
    async function fetchAndDisplayGameState() {
        if (!currentGameId) { console.error("fetchAndDisplayGameState: No currentGameId!"); return; }
        console.log("fetchAndDisplayGameState: Cargando ID:", currentGameId);
        try {
            const gameState = await apiRequest(`get-game-state?gameId=${currentGameId}`, 'GET');
            console.log("fetchAndDisplayGameState: Estado recibido:", gameState);
            currentPlayers = gameState.players || [];
            currentDebts = gameState.debts || [];

            updatePlayerList();
            updateSelectOptions(); // <-- Llamada importante
            calculateDebtSummary();
            updateDebtMatrix();

            if (currentPlayers.length < 2) {
                 console.log("fetchAndDisplayGameState: Juego cargado tiene < 2 jugadores...");
                 showPage('register-players-page');
                 if(playerNameInput) playerNameInput.focus();
            } else {
                 console.log("fetchAndDisplayGameState: Juego cargado OK. Yendo a deudas.");
                 showPage('register-debts-page');
            }

        } catch (error) {
            // apiRequest ya mostró alert. Limpiar estado local.
             console.error("fetchAndDisplayGameState: Error fetching game state:", error);
            localStorage.removeItem('currentGameId');
            currentGameId = null;
            resetLocalState();
            const continueBtn = document.getElementById('continue-game');
            if (continueBtn) continueBtn.disabled = true;
            showPage('welcome-page');
        }
    }


    // --- Navegación entre Páginas ---

    // Listener para Iniciar Nuevo Juego (Versión Checkpoint)
    startGameButton.addEventListener('click', async () => {
         console.log("startGameButton: Presionado.");
        // Advertir si hay un juego activo que se perderá
        if (localStorage.getItem('currentGameId')) { // Usar localStorage aquí para saber si había algo guardado
            if (!confirm('Al iniciar un juego nuevo, se perderá el acceso rápido al juego anterior. ¿Continuar?')) {
                 console.log("startGameButton: Cancelado por usuario.");
                return;
            }
             console.log("startGameButton: Usuario confirma iniciar nuevo.");
        }

        // Limpiar estado antes de crear nuevo
        currentGameId = null; // Asegura que no se use un ID viejo en las APIs
        resetLocalState(); // Limpia arrays locales y UI básica
        const continueBtn = document.getElementById('continue-game');
        if (continueBtn) continueBtn.disabled = true; // Deshabilitar por si acaso

        console.log("startGameButton: Intentando API /api/start-game...");
        try {
            const data = await apiRequest('start-game', 'POST');
            // Verificar respuesta
            if (!data || !data.gameId) {
                throw new Error("Respuesta API inválida al crear juego: no gameId.");
            }
            currentGameId = data.gameId; // Guarda el ID del nuevo juego
            localStorage.setItem('currentGameId', currentGameId); // Guarda en localStorage
            console.log("startGameButton: Nuevo juego iniciado con ID:", currentGameId);

            // Actualizar UI para juego vacío (resetLocalState ya hizo parte)
            updatePlayerList();
            updateSelectOptions(); // Asegurar selects vacíos
            updateDebtMatrix(); // Asegurar matriz vacía

            console.log("startGameButton: Mostrando 'register-players-page'.");
            showPage('register-players-page');
            if(playerNameInput) playerNameInput.focus();

        } catch (error) {
             // apiRequest ya muestra alert. Limpiar por si acaso.
            console.error("startGameButton: Error capturado:", error);
            localStorage.removeItem('currentGameId'); // Limpiar si falló
            currentGameId = null;
            resetLocalState();
             if(continueBtn) continueBtn.disabled = true;
            showPage('welcome-page'); // Volver a bienvenida
        }
    });

    // Listener Ir a Deudas
    finishRegistrationButton.addEventListener('click', () => {
        if (currentPlayers.length < 2) {
            alert('Debes registrar al menos dos jugadores.');
            return;
        }
        console.log("finishRegistrationButton: Pasando a deudas. Jugadores:", JSON.stringify(currentPlayers));
        // Asegurarse que los selects y la matriz estén actualizados
        updateSelectOptions(); // <-- Llamada Clave
        calculateDebtSummary();
        updateDebtMatrix();
        showPage('register-debts-page');
    });

    // Listener Agregar más jugadores
    addNewPlayerButton.addEventListener('click', () => {
        console.log("addNewPlayerButton: Volviendo a registro de jugadores.");
        showPage('register-players-page');
        if(playerNameInput) playerNameInput.focus();
    });

    // --- Lógica de Jugadores ---
    registerPlayerButton.addEventListener('click', async () => {
        const playerName = playerNameInput.value.trim();
        if (!playerName) { alert('Introduce un nombre.'); return; }
        if (currentPlayers.includes(playerName)) { alert(`Jugador "${playerName}" ya existe.`); if(playerNameInput) playerNameInput.select(); return; }
        if (!currentGameId) { alert("Error: No hay juego activo."); return; }

        console.log(`registerPlayerButton: Intentando añadir "${playerName}" a ${currentGameId}`);
        try {
            await apiRequest('add-player', 'POST', { gameId: currentGameId, playerName });
            console.log(`registerPlayerButton: API OK. Añadiendo localmente.`);
            // Actualización local optimista
            currentPlayers.push(playerName);
            updatePlayerList();
            updateSelectOptions(); // Actualizar selects también aquí
            calculateDebtSummary(); // Recalcular por si acaso (no debería cambiar)
            updateDebtMatrix();

            if(playerNameInput) { playerNameInput.value = ''; playerNameInput.focus(); }

        } catch (error) {
             // apiRequest ya mostró alert.
             console.error("registerPlayerButton: Error capturado:", error);
             if(playerNameInput) playerNameInput.select();
        }
    });

    playerNameInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') { event.preventDefault(); registerPlayerButton.click(); }
    });

    // --- Lógica de Deudas ---
    registerDebtButton.addEventListener('click', async () => {
        const debtor = debtorSelect.value; const winner = winnerSelect.value; const amount = parseFloat(debtAmountInput.value);
        if (!debtor || !winner) { alert('Selecciona deudor y acreedor.'); return; }
        if (debtor === winner) { alert('Deudor y acreedor iguales.'); return; }
        if (isNaN(amount) || amount <= 0) { alert('Monto inválido.'); if(debtAmountInput) debtAmountInput.focus(); return; }
        if (!currentGameId) { alert("Error: No hay juego activo."); return; }

        console.log(`registerDebtButton: Intentando añadir deuda ${debtor}->${winner} ${amount} a ${currentGameId}`);
        try {
            await apiRequest('add-debt', 'POST', { gameId: currentGameId, debtor, winner, amount });
             console.log(`registerDebtButton: API OK. Añadiendo localmente.`);
            // Actualización local optimista
            currentDebts.push({ debtor, winner, amount });
            calculateDebtSummary(); // Recalcular
            updateDebtMatrix(); // Actualizar tabla

            if(debtAmountInput) debtAmountInput.value = '';
            // Opcional: devolver foco a deudor/acreedor o monto? Por ahora al monto.
             if(debtAmountInput) debtAmountInput.focus();

        } catch (error) {
            console.error("registerDebtButton: Error capturado:", error);
             // apiRequest ya mostró alert.
        }
    });

    // --- Lógica de Finalización (confirm() simple) ---
    endGameButton.addEventListener('click', async () => {
         if (!currentGameId) { alert("No hay juego activo."); return; }
         console.log("endGameButton: Presionado.");

        if (confirm('¿Estás seguro de que deseas finalizar y BORRAR permanentemente los datos de este juego?')) {
             console.log("endGameButton: Usuario confirma borrado.");
            console.log(`endGameButton: Intentando API /api/end-game para ${currentGameId}`);
             try {
                 // Usamos POST con body como en la API Edge, apiRequest lo manejará
                 await apiRequest('end-game', 'POST', { gameId: currentGameId });
                 console.log("endGameButton: API OK (o no lanzó error).");
             } catch (error) {
                  console.error("endGameButton: Error en llamada API (puede ser normal si ya no existe):", error);
             }
             // Siempre limpiar localmente
             console.log("endGameButton: Limpiando estado local...");
             localStorage.removeItem('currentGameId');
             currentGameId = null;
             resetLocalState();
             const continueBtn = document.getElementById('continue-game');
             if (continueBtn) continueBtn.disabled = true;
             showPage('welcome-page');
        } else {
            console.log("endGameButton: Usuario canceló borrado.");
        }
    });

    // --- Funciones Auxiliares ---

    /** Muestra la página con el ID dado y oculta las demás (versión simple) */
    function showPage(pageIdToShow) {
         console.log(`--- showPage: Intentando mostrar ${pageIdToShow} ---`);
        document.querySelectorAll('.page').forEach(page => {
            // Asumiendo que todos los .page tienen ID
             if (page && page.style) {
                page.style.display = page.id === pageIdToShow ? 'block' : 'none';
            }
        });
         console.log(`--- showPage: ${pageIdToShow} debería estar visible ---`);
    }

    /** Actualiza la lista visual (ul#player-list) */
    function updatePlayerList() {
        if (!playerList) return; // Verificar si existe
        playerList.innerHTML = '';
        currentPlayers.forEach(player => {
            const li = document.createElement('li');
            li.textContent = player;
            playerList.appendChild(li);
        });
        console.log("updatePlayerList ejecutado.");
    }

    /** Actualiza las opciones en los <select> */
    function updateSelectOptions() {
         // Verificar si existen los selects
         if (!debtorSelect || !winnerSelect) {
              console.error("updateSelectOptions: Selects no encontrados!");
              return;
         }
        const currentDebtor = debtorSelect.value;
        const currentWinner = winnerSelect.value;
        debtorSelect.innerHTML = ''; winnerSelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = ""; defaultOption.textContent = "-- Selecciona Jugador --"; defaultOption.disabled = true;
        debtorSelect.appendChild(defaultOption.cloneNode(true)); winnerSelect.appendChild(defaultOption.cloneNode(true));

        console.log(`updateSelectOptions: Añadiendo ${currentPlayers.length} jugadores:`, JSON.stringify(currentPlayers)); // Log
        currentPlayers.forEach((player, index) => {
             console.log(`updateSelectOptions: [${index}] Añadiendo: ${player}`); // Log
            const option = document.createElement('option');
            option.value = player; option.textContent = player;
            debtorSelect.appendChild(option.cloneNode(true)); winnerSelect.appendChild(option.cloneNode(true));
        });

        // Restaurar selección
        debtorSelect.value = currentPlayers.includes(currentDebtor) ? currentDebtor : "";
        winnerSelect.value = currentPlayers.includes(currentWinner) ? currentWinner : "";
        if (!debtorSelect.value) debtorSelect.value = ""; if (!winnerSelect.value) winnerSelect.value = "";
        console.log(`updateSelectOptions: Selección final (debtor: '${debtorSelect.value}', winner: '${winnerSelect.value}').`); // Log
    }

    /** Inicializa/Resetea la estructura del objeto `summary` */
    function initializeDebtSummary() {
        summary = {};
        currentPlayers.forEach(p1 => { summary[p1] = {}; currentPlayers.forEach(p2 => { if (p1 !== p2) summary[p1][p2] = 0; }); });
    }

    /** Calcula el resumen (`summary`) */
    function calculateDebtSummary() {
        initializeDebtSummary();
        let grossDebts = {};
        currentPlayers.forEach(p1 => { grossDebts[p1] = {}; currentPlayers.forEach(p2 => { if (p1 !== p2) grossDebts[p1][p2] = 0; }); });
        currentDebts.forEach(debt => { if (grossDebts[debt.debtor] && grossDebts[debt.debtor].hasOwnProperty(debt.winner)) { grossDebts[debt.debtor][debt.winner] += Number(debt.amount) || 0; } });
        currentPlayers.forEach(p1 => { currentPlayers.forEach(p2 => { if (p1 === p2) return; const amountP1toP2 = grossDebts[p1]?.[p2] || 0; const amountP2toP1 = grossDebts[p2]?.[p1] || 0; const netDifference = amountP1toP2 - amountP2toP1; if (netDifference > 0) { summary[p1][p2] = netDifference; if (summary[p2]) summary[p2][p1] = 0; } else { summary[p1][p2] = 0; } }); });
        console.log("calculateDebtSummary: Resumen calculado:", summary); // Log
    }

    /** Dibuja la tabla HTML (`debt-matrix`) */
    function updateDebtMatrix() {
         // Verificar elementos tabla
         if (!debtMatrixThead || !debtMatrixTbody) { console.error("updateDebtMatrix: falta thead o tbody!"); return; }
        debtMatrixThead.innerHTML = ''; debtMatrixTbody.innerHTML = '';
        if (currentPlayers.length === 0) { console.log("updateDebtMatrix: No hay jugadores, tabla vacía."); return; }
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

    /** Reinicia el estado local (variables JS y algunos campos UI) */
    function resetLocalState() {
        console.log("resetLocalState ejecutado.");
        currentPlayers = []; currentDebts = []; summary = {};
        if (playerNameInput) playerNameInput.value = '';
        if (debtAmountInput) debtAmountInput.value = '';
        if (playerList) playerList.innerHTML = '';
        // Es importante llamar a estas para limpiar la UI relacionada
        updateSelectOptions(); // Limpia y resetea selects
        updateDebtMatrix(); // Limpia la tabla
    }

    // --- Inicialización Final ---
    console.log("Inicialización JS completada. Llamando a loadExistingGame...");
    loadExistingGame(); // Llama a la versión con confirm()

}); // Fin del DOMContentLoaded
// ----- FIN CÓDIGO script.js COMPLETO (v13 - Checkpoint Funcional) -----