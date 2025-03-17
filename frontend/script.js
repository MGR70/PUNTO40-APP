document.addEventListener('DOMContentLoaded', () => {
    const welcomePage = document.getElementById('welcome-page');
    const gamePage = document.getElementById('game-page');
    const startGameButton = document.getElementById('start-game');
    const registerPlayerButton = document.getElementById('register-player');
    const registerDebtButton = document.getElementById('register-debt');
    const endGameButton = document.getElementById('end-game');
    const playerNameInput = document.getElementById('player-name');
    const playerList = document.getElementById('player-list');
    const debtorSelect = document.getElementById('debtor');
    const winnerSelect = document.getElementById('winner');
    const debtAmountInput = document.getElementById('debt-amount');
    const debtMatrix = document.getElementById('debt-matrix');

    let players = [];
    let debts = [];

    startGameButton.addEventListener('click', () => {
        welcomePage.style.display = 'none';
        gamePage.style.display = 'block';
    });

    registerPlayerButton.addEventListener('click', () => {
        const playerName = playerNameInput.value.trim();
        if (playerName && !players.includes(playerName)) {
            players.push(playerName);
            updatePlayerList();
            updateSelectOptions();
            playerNameInput.value = '';
        }
    });

    registerDebtButton.addEventListener('click', () => {
        const debtor = debtorSelect.value;
        const winner = winnerSelect.value;
        const amount = parseFloat(debtAmountInput.value);

        if (debtor && winner && amount > 0) {
            debts.push({ debtor, winner, amount });
            updateDebtSummary();
            debtAmountInput.value = '';
        }
    });

    endGameButton.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas finalizar el juego?')) {
            players = [];
            debts = [];
            updatePlayerList();
            updateDebtSummary();
            welcomePage.style.display = 'block';
            gamePage.style.display = 'none';
        }
    });

    function updatePlayerList() {
        playerList.innerHTML = '';
        players.forEach(player => {
            const li = document.createElement('li');
            li.textContent = player;
            playerList.appendChild(li);
        });
    }

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

    function updateDebtSummary() {
        const summary = calculateDebtSummary();
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
                const amount = summary[debtor] && summary[debtor][winner] ? summary[debtor][winner] : 0;
                cell.textContent = amount;
                row.appendChild(cell);
            });

            debtMatrix.appendChild(row);
        });
    }

    function calculateDebtSummary() {
        const summary = {};

        debts.forEach(debt => {
            if (!summary[debt.debtor]) {
                summary[debt.debtor] = {};
            }
            if (!summary[debt.debtor][debt.winner]) {
                summary[debt.debtor][debt.winner] = 0;
            }
            summary[debt.debtor][debt.winner] += debt.amount;
        });

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
                        summary[debtor][winner] = netDebt;
                    } else if (netDebt < 0) {
                        if (!summary[winner]) {
                            summary[winner] = {};
                        }
                        summary[winner][debtor] = -netDebt;
                    }
                }
            });
        });

        return summary;
    }
});
