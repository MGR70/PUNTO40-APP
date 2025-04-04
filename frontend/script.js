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
    const debtMatrixThead = debtMatrixTable.querySelector('thead'); // Para cabecera
    const debtMatrixTbody = debtMatrixTable.querySelector('tbody'); // Para cuerpo

    // --- Estado de la Aplicación ---
    let players = []; // Array para almacenar nombres de jugadores
    let debts = [];   // Array para almacenar objetos de deuda { debtor, winner, amount }
    let summary = {}; // Objeto para almacenar el resumen de deudas netas { debtor: { winner: netAmount } }

    // --- Navegación entre Páginas ---
    startGameButton.addEventListener('click', () => {
        resetGame(); // Asegura un estado limpio al iniciar
        showPage('register-players-page');
        playerNameInput.focus();
    });

    finishRegistrationButton.addEventListener('click', () => { // Botón "Ir al Registro de Deudas"
        if (players.length < 2) {
            alert('Debes registrar al menos dos jugadores.');
            return;
        }
        showPage('register-debts-page');
        // Siempre actualizar selects, calcular resumen y dibujar matriz al entrar aquí
        updateSelectOptions();
        calculateDebtSummary(); // Usa 'players' y 'debts' actuales
        updateDebtMatrix();
    });

    addNewPlayerButton.addEventListener('click', () => { // Botón "Agregar Más Jugadores"
        showPage('register-players-page'); // Volver a registro sin borrar datos
        playerNameInput.focus();
    });

    // --- Lógica de Jugadores ---
    registerPlayerButton.addEventListener('click', () => {
        const playerName = playerNameInput.value.trim();
        if (!playerName) {
            alert('Por favor, introduce un nombre de jugador.');
            return; // Salir si está vacío
        }
        if (players.includes(playerName)) {
            alert(`El jugador "${playerName}" ya ha sido registrado.`);
            playerNameInput.select(); // Seleccionar para fácil reemplazo
            return; // Salir si ya existe
        }

        players.push(playerName);
        updatePlayerList(); // Actualiza la lista visual en la pág de registro
        playerNameInput.value = ''; // Limpiar input
        playerNameInput.focus(); // Devolver foco
    });

    playerNameInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Evitar envío de formulario si estuviera en uno
            registerPlayerButton.click(); // Simular click en botón
        }
    });

    // --- Lógica de Deudas ---
    registerDebtButton.addEventListener('click', () => {
        const debtor = debtorSelect.value;
        const winner = winnerSelect.value;
        // Obtener monto y asegurar que sea número positivo
        const amount = parseFloat(debtAmountInput.value);

        // Validaciones más robustas
        if (!debtor || !winner) {
            alert('Debes seleccionar un deudor y un acreedor.');
            return;
        }
        if (debtor === winner) {
            alert('El deudor y el acreedor no pueden ser el mismo jugador.');
            return;
        }
        if (isNaN(amount) || amount <= 0) {
            alert('Por favor, introduce un monto de deuda válido y mayor que cero.');
            debtAmountInput.focus(); // Poner foco en el campo de monto
            return;
        }

        // Añadir la deuda al historial
        debts.push({ debtor, winner, amount });

        // Recalcular el resumen completo y actualizar la visualización
        calculateDebtSummary();
        updateDebtMatrix();

        // Limpiar solo el monto, mantener los jugadores seleccionados puede ser útil
        debtAmountInput.value = '';
        debtAmountInput.focus(); // Poner foco en el monto para la siguiente deuda
    });

    // --- Lógica de Finalización ---
    endGameButton.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas finalizar el juego? Se borrarán todos los jugadores y deudas.')) {
            resetGame();
            showPage('welcome-page');
        }
    });

    // --- Funciones Auxiliares ---

    /** Muestra la página con el ID dado y oculta las demás */
    function showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = page.id === pageId ? 'block' : 'none';
        });
    }

    /** Actualiza la lista visual (ul#player-list) de jugadores registrados */
    function updatePlayerList() {
        playerList.innerHTML = ''; // Limpiar lista
        players.forEach(player => {
            const li = document.createElement('li');
            li.textContent = player;
            playerList.appendChild(li);
        });
    }

    /** Actualiza las opciones en los menús desplegables (select) */
    function updateSelectOptions() {
        const currentDebtor = debtorSelect.value; // Guardar selección actual
        const currentWinner = winnerSelect.value; // Guardar selección actual

        debtorSelect.innerHTML = ''; // Limpiar selects
        winnerSelect.innerHTML = '';

        // Añadir opción placeholder inicial
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "-- Selecciona Jugador --";
        defaultOption.disabled = true;
        defaultOption.selected = true; // Seleccionar por defecto

        debtorSelect.appendChild(defaultOption.cloneNode(true));
        winnerSelect.appendChild(defaultOption.cloneNode(true));

        // Añadir cada jugador como opción
        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            debtorSelect.appendChild(option.cloneNode(true));
            winnerSelect.appendChild(option.cloneNode(true));
        });

        // Intentar restaurar la selección anterior si los jugadores aún existen
        if (players.includes(currentDebtor)) {
            debtorSelect.value = currentDebtor;
        }
        if (players.includes(currentWinner)) {
            winnerSelect.value = currentWinner;
        }
    }

    /** Inicializa/Resetea la estructura del objeto `summary` con ceros para todos los pares de jugadores actuales */
    function initializeDebtSummary() {
        summary = {};
        players.forEach(p1 => {
            summary[p1] = {};
            players.forEach(p2 => {
                if (p1 !== p2) {
                    summary[p1][p2] = 0; // Deuda neta inicial p1 -> p2 es 0
                }
            });
        });
    }

    /** Calcula el resumen de deudas netas (`summary`) basado en `players` y `debts` actuales */
    function calculateDebtSummary() {
        // 1. Reiniciar la estructura del summary con jugadores actuales y valores a 0
        initializeDebtSummary();

        // 2. Crear estructura temporal para deudas brutas
        let grossDebts = {};
        players.forEach(p1 => {
            grossDebts[p1] = {};
            players.forEach(p2 => { if (p1 !== p2) grossDebts[p1][p2] = 0; });
        });

        // 3. Acumular deudas brutas desde el array `debts`
        debts.forEach(debt => {
            // Asegurar que ambos jugadores de la deuda existan en la lista actual
            // de jugadores antes de intentar sumar la deuda bruta
            if (grossDebts[debt.debtor] && grossDebts[debt.debtor].hasOwnProperty(debt.winner)) {
                grossDebts[debt.debtor][debt.winner] += debt.amount;
            }
        });

        // 4. Calcular deudas netas y actualizar el `summary` final
        players.forEach(p1 => {
            players.forEach(p2 => {
                // *** CORRECCIÓN AQUÍ: Usar return en lugar de continue ***
                if (p1 === p2) return; // Saltar diagonal (sale de esta iteración del callback interno)

                const amountP1toP2 = grossDebts[p1]?.[p2] || 0; // Deuda bruta p1 -> p2
                const amountP2toP1 = grossDebts[p2]?.[p1] || 0; // Deuda bruta p2 -> p1

                const netDifference = amountP1toP2 - amountP2toP1;

                if (netDifference > 0) {
                    // p1 debe neto a p2. Actualizar summary[p1][p2]
                    summary[p1][p2] = netDifference;
                }
                // Si netDifference <= 0, p1 no debe neto a p2.
                // summary[p1][p2] permanece en 0 (ya inicializado).
            });
        });
    }


    /** Dibuja la tabla HTML (`debt-matrix`) basada en el `summary` actual */
    function updateDebtMatrix() {
        debtMatrixThead.innerHTML = ''; // Limpiar cabecera
        debtMatrixTbody.innerHTML = ''; // Limpiar cuerpo

        if (players.length === 0) return; // Salir si no hay jugadores

        // --- Crear Cabecera (THEAD) ---
        const headerRow = debtMatrixThead.insertRow();
        const cornerTh = document.createElement('th');
        // cornerTh.textContent = 'Deudor ↓ / Acreedor →'; // Texto para esquina
        cornerTh.innerHTML = 'Deudor ↓ / Acreedor →'; // Con espacios sin ruptura
        headerRow.appendChild(cornerTh);
        players.forEach(player => { // Añadir nombres de acreedores (columnas)
            const th = document.createElement('th');
            th.textContent = player;
            headerRow.appendChild(th);
        });

        // --- Crear Cuerpo (TBODY) ---
        players.forEach(debtor => { // Para cada deudor (fila)
            const row = debtMatrixTbody.insertRow();

            // Celda de cabecera de fila (nombre del deudor)
            const debtorHeaderCell = document.createElement('th');
            debtorHeaderCell.textContent = debtor;
            row.appendChild(debtorHeaderCell);

            // Celdas de datos (deudas netas)
            players.forEach(winner => { // Para cada acreedor (columna)
                const cell = row.insertCell();
                if (debtor === winner) {
                    cell.textContent = '-';
                    cell.className = 'diagonal'; // Aplicar clase CSS
                } else {
                    // Obtener deuda neta de debtor -> winner desde el summary
                    const netDebt = summary[debtor]?.[winner] || 0; // Acceso seguro
                    // Formatear a 2 decimales si no es cero
                    cell.textContent = netDebt > 0 ? netDebt.toFixed(2) : '';

                    // Aplicar clases CSS según el valor
                    if (netDebt > 0) {
                        cell.className = 'has-debt';
                    } else {
                        cell.className = 'no-debt';
                        // Opcional: mostrar '0.00' en lugar de vacío si prefieres
                        // cell.textContent = '0.00';
                    }
                }
            });
        });
    }

    /** Reinicia completamente el estado del juego */
    function resetGame() {
        players = [];
        debts = [];
        summary = {};
        playerList.innerHTML = '';
        debtMatrixThead.innerHTML = ''; // Limpiar tabla
        debtMatrixTbody.innerHTML = ''; // Limpiar tabla
        playerNameInput.value = '';
        debtAmountInput.value = '';
        // Resetear selects a estado inicial
        updateSelectOptions(); // Llama a esta función para poner los placeholders
    }

    // --- Inicialización al cargar la página ---
    showPage('welcome-page'); // Mostrar bienvenida

}); // Fin del DOMContentLoaded
