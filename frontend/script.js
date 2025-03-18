document.addEventListener('DOMContentLoaded', () => {
    // Elementos de la página
    const welcomePage = document.getElementById('welcome-page');
    const registerPlayersPage = document.getElementById('register-players-page');
    const registerDebtsPage = document.getElementById('register-debts-page');
    const startGameButton = document.getElementById('start-game');
    const registerPlayerButton = document.getElementById('register-player');
    const finishRegistrationButton = document.getElementById('finish-registration');
    const startMatchButton = document.getElementById('start-match');
    const endGameButton = document.getElementById('end-game');
    const addNewPlayerButton = document.getElementById('add-new-player');
    const debtForm = document.getElementById('debt-form');
    const registerDebtButton = document.getElementById('register-debt');
    const playerNameInput = document.getElementById('player-name');
    const playerList = document.getElementById('player-list');
    const debtorSelect = document.getElementById('debtor');
    const winnerSelect = document.getElementById('winner');
    const debtAmountInput = document.getElementById('debt-amount');
    const debtMatrix = document.getElementById('debt-matrix');

    // Variables globales
    let players = [];
    let debts = [];
    let summary = {};

    // Navegación entre páginas
    startGameButton.addEventListener('click', () => {
        welcomePage.style.display = 'none';
        registerPlayersPage.style.display = 'block';
    });

    finishRegistrationButton.addEventListener('click', () => {
        registerPlayersPage.style.display = 'none';
        registerDebtsPage.style.display = 'block';
        initializeDebtSummary(); // Inicializar la matriz de deudas
    });

    addNewPlayerButton.addEventListener('click', () => {
        registerDebtsPage.style.display = 'none';
        registerPlayersPage.style.display = 'block';
    });

    // Registrar jugador
    registerPlayerButton.addEventListener('click', () => {
        const playerName = playerNameInput.value.trim();
        if (playerName && !players.includes(playerName)) {
            players.push(playerName);
            updatePlayerList();
            updateSelectOptions();
            playerNameInput.value = '';
        }
    });

    // Mostrar formulario para registrar deuda
    startMatchButton.addEventListener('click', () => {
        debtForm.style.display = 'block';
    });

    // Registrar deuda
    registerDebtButton.addEventListener('click', () => {
        const debtor = debtorSelect.value;
        const winner = winnerSelect.value;
        const amount = parseFloat(debtAmountInput.value);

        if (debtor && winner && amount > 0) {
            debts.push({ debtor, winner, amount });
            calculateDebtSummary(); // Calcular deudas netas
            updateDebtMatrix(); // Actualizar la matriz
            debtAmountInput.value = ''; // Limpiar el campo de monto
        }
    });

    // Finalizar juego
    endGameButton.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas finalizar el juego?')) {
            players = [];
            debts = [];
            summary = {};
            welcomePage.style.display = 'block';
            registerDebtsPage.style.display = 'none';
        }
    });

    // Inicializar la matriz de deudas
    function initializeDebtSummary() {
        summary = {};
        players.forEach(debtor => {
            summary[debtor] = {};
            players.forEach(winner => {
                if (debtor !== winner) {
                    summary[debtor][winner] = 0;
                }
            });
        });
        updateDebtMatrix();
    }

    // Calcular deudas netas en una sola dirección
    function calculateDebtSummary() {
        summary = {}; // Reiniciar el resumen

        // Calcular las deudas brutas en una sola dirección (deudor → ganador)
        debts.forEach(debt => {
            if (!summary[debt.debtor]) {
                summary[debt.debtor] = {};
            }
            if (!summary[debt.debtor][debt.winner]) {
                summary[debt.debtor][debt.winner] = 0;
            }
            summary[debt.debtor][debt.winner] += debt.amount;
        });

        // Calcular las deudas netas en una sola dirección
        players.forEach(debtor => {
            players.forEach(winner => {
                if (debtor !== winner) {
                    const debtorToWinner = summary[debtor] && summary[debtor][winner] ? summary[debtor][winner] : 0;
                    const winnerToDebtor = summary[winner] && summary[winner][debtor] ? summary[winner][debtor] : 0;
                    const netDebt = debtorToWinner - winnerToDebtor;

                    if (netDebt > 0) {
                        if (!summary[debtor]) {
                            summary[debtor] = {};
                        }
                        summary[debtor][winner] = netDebt; // Asignar a la celda correcta (deudor → ganador)
                        if (summary[winner]) {
                            summary[winner][debtor] = 0; // Limpiar la celda opuesta
                        }
                    } else if (netDebt < 0) {
                        if (!summary[winner]) {
                            summary[winner] = {};
                        }
                        summary[winner][debtor] = -netDebt; // Asignar a la celda correcta (ganador → deudor)
                        if (summary[debtor]) {
                            summary[debtor][winner] = 0; // Limpiar la celda opuesta
                        }
                    } else {
                        if (summary[debtor]) {
                            summary[debtor][winner] = 0;
                        }
                        if (summary[winner]) {
                            summary[winner][debtor] = 0;
                        }
                    }
                }
            });
        });
    }

    // Actualizar la matriz de deudas en el DOM
    function updateDebtMatrix() {
        debtMatrix.innerHTML = '';

        const headerRow = document.createElement('tr');
        headerRow.appendChild(document.createElement('th'));
        players.forEach(player => {
            const th = document.createElement('th');
            th.textContent = player;
            headerRow.appendChild(th);
        });
        debtMatrix.appendChild(headerRow);

        players.forEach(debtor => {
            const row = document.createElement('tr');
            const debtorHeader = document.createElement('th');
            debtorHeader.textContent = debtor;
            row.appendChild(debtorHeader);

            players.forEach(winner => {
                const cell = document.createElement('td');
                if (debtor === winner) {
                    cell.textContent = '-';
                } else {
                    const netDebt = summary[debtor] && summary[debtor][winner] ? summary[debtor][winner] : 0;
                    cell.textContent = netDebt > 0 ? netDebt : '';
                }
                row.appendChild(cell);
            });

            debtMatrix.appendChild(row);
        });
    }

    // Actualizar la lista de jugadores
    function updatePlayerList() {
        playerList.innerHTML = '';
        players.forEach(player => {
            const li = document.createElement('li');
            li.textContent = player;
            playerList.appendChild(li);
        });
    }

    // Actualizar opciones de selección (deudor y ganador)
    function updateSelectOptions() {
        debtorSelect.innerHTML = '';
        winnerSelect.innerHTML = '';
        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            debtorSelect.appendChild(option.cloneNode(true));
            winnerSelect.appendChild(option);
        });
    }
});
