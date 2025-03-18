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

  // Navegación entre páginas
  startGameButton.addEventListener('click', () => {
    console.log('Botón "Iniciar Juego" clickeado'); // Depuración
    welcomePage.style.display = 'none';
    registerPlayersPage.style.display = 'block';
  });

  finishRegistrationButton.addEventListener('click', () => {
    registerPlayersPage.style.display = 'none';
    registerDebtsPage.style.display = 'block';
    updateSelectOptions();
    fetchDebtSummary();
  });

  addNewPlayerButton.addEventListener('click', () => {
    registerDebtsPage.style.display = 'none';
    registerPlayersPage.style.display = 'block';
  });

  // Registrar jugador
  registerPlayerButton.addEventListener('click', async () => {
    const playerName = playerNameInput.value.trim();
    if (playerName && !players.includes(playerName)) {
      try {
        const response = await fetch('/api/jugadores', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nombre: playerName }),
        });
        const newPlayer = await response.json();
        players.push(newPlayer.nombre);
        updatePlayerList();
        updateSelectOptions();
        playerNameInput.value = '';
      } catch (error) {
        console.error('Error al registrar el jugador:', error);
      }
    }
  });

  // Mostrar formulario para registrar deuda
  startMatchButton.addEventListener('click', () => {
    debtForm.style.display = 'block';
  });

  // Registrar deuda
  registerDebtButton.addEventListener('click', async () => {
    const debtor = debtorSelect.value;
    const winner = winnerSelect.value;
    const amount = parseFloat(debtAmountInput.value);

    if (debtor && winner && amount > 0) {
      try {
        const response = await fetch('/api/deudas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            deudor_id: players.indexOf(debtor) + 1,
            ganador_id: players.indexOf(winner) + 1,
            monto: amount,
          }),
        });
        const newDebt = await response.json();
        debts.push(newDebt);
        fetchDebtSummary();
        debtAmountInput.value = '';
      } catch (error) {
        console.error('Error al registrar la deuda:', error);
      }
    }
  });

  // Finalizar juego
  endGameButton.addEventListener('click', async () => {
    if (confirm('¿Estás seguro de que deseas finalizar el juego?')) {
      try {
        // Borrar todas las deudas
        await fetch('/api/deudas', {
          method: 'DELETE',
        });

        // Reiniciar el estado local
        players = [];
        debts = [];
        welcomePage.style.display = 'block';
        registerDebtsPage.style.display = 'none';
      } catch (error) {
        console.error('Error al finalizar el juego:', error);
      }
    }
  });

  // Obtener y mostrar la matriz de deudas
  async function fetchDebtSummary() {
    try {
      const response = await fetch('/api/deudas');
      const debts = await response.json();
      updateDebtMatrix(debts);
    } catch (error) {
      console.error('Error al obtener las deudas:', error);
    }
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

  // Actualizar la matriz de deudas en el DOM
  function updateDebtMatrix(debts) {
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
          const debt = debts.find(
            d => d.deudor_id === players.indexOf(debtor) + 1 && d.ganador_id === players.indexOf(winner) + 1
          );
          cell.textContent = debt ? debt.monto : '';
        }
        row.appendChild(cell);
      });

      debtMatrix.appendChild(row);
    });
  }
});
