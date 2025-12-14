const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
document.querySelectorAll('[data-hack]').forEach(item => {
    item.onmouseover = event => {
        let iterations = 0;
        const interval = setInterval(() => {
            event.target.innerText = event.target.innerText
                .split("").map((letter, index) => {
                    if (index < iterations) return event.target.dataset.hack[index];
                    return letters[Math.floor(Math.random() * 43)];
                }).join("");
            if (iterations >= event.target.dataset.hack.length) clearInterval(interval);
            iterations += 1 / 3;
        }, 30);
    }
});

const matrixSize = 5;
const hexCodes = ['1C', 'BD', '55', 'E9', '7A', 'FF'];
const bufferSize = 4;

let matrix = [];
let buffer = [];
let targetSequence = [];
let currentRow = 0;
let currentCol = 0;
let isRowTurn = true;
let gameOver = false;

const matrixEl = document.getElementById('matrix');
const bufferEl = document.getElementById('buffer');
const targetEl = document.getElementById('target-seq');
const statusEl = document.getElementById('game-status');
const restartBtn = document.getElementById('restart-btn');

function initGame() {
    matrix = [];
    buffer = [];
    isRowTurn = true;
    currentRow = 0;
    gameOver = false;

    statusEl.innerText = "";
    statusEl.className = "game-status";
    restartBtn.style.display = "none";

    targetSequence = [
        hexCodes[Math.floor(Math.random() * hexCodes.length)],
        hexCodes[Math.floor(Math.random() * hexCodes.length)],
        hexCodes[Math.floor(Math.random() * hexCodes.length)]
    ];

    generateMatrix();
    renderGame();
}

function generateMatrix() {
    matrixEl.innerHTML = '';
    for (let r = 0; r < matrixSize; r++) {
        let row = [];
        for (let c = 0; c < matrixSize; c++) {
            let code = hexCodes[Math.floor(Math.random() * hexCodes.length)];
            if (r === 0 && Math.random() > 0.6) code = targetSequence[0];
            row.push({ code: code, used: false });
        }
        matrix.push(row);
    }
}

function renderGame() {
    matrixEl.innerHTML = '';
    for (let r = 0; r < matrixSize; r++) {
        for (let c = 0; c < matrixSize; c++) {
            const cell = document.createElement('div');
            cell.className = 'matrix-cell';
            cell.innerText = matrix[r][c].code;

            if (matrix[r][c].used) {
                cell.classList.add('cell-selected');
                cell.innerText = "[]";
            } else {
                if (!gameOver) {
                    if (isRowTurn && r === currentRow) {
                        cell.classList.add('cell-valid');
                        cell.onclick = () => handleMove(r, c);
                    } else if (!isRowTurn && c === currentCol) {
                        cell.classList.add('cell-valid');
                        cell.onclick = () => handleMove(r, c);
                    }
                }
            }
            matrixEl.appendChild(cell);
        }
    }

    bufferEl.innerHTML = '';
    for (let i = 0; i < bufferSize; i++) {
        const slot = document.createElement('div');
        slot.className = 'buffer-slot';
        if (buffer[i]) {
            slot.innerText = buffer[i];
            slot.style.border = "1px solid var(--cp-yellow)";
            slot.style.background = "var(--cp-yellow)";
            slot.style.color = "#000";
            slot.style.fontWeight = "bold";
        }
        bufferEl.appendChild(slot);
    }

    targetEl.innerHTML = '';
    targetSequence.forEach(code => {
        const span = document.createElement('span');
        span.className = 'target-cell';
        span.innerText = code;
        targetEl.appendChild(span);
    });
}

function handleMove(r, c) {
    if (gameOver) return;

    const code = matrix[r][c].code;
    buffer.push(code);
    matrix[r][c].used = true;

    if (isRowTurn) {
        currentCol = c;
        isRowTurn = false;
    } else {
        currentRow = r;
        isRowTurn = true;
    }

    renderGame();
    checkWinCondition();
}

function checkWinCondition() {
    let matchFound = false;
    if (buffer.length >= targetSequence.length) {
        const bufferStr = buffer.join(',');
        const targetStr = targetSequence.join(',');
        if (bufferStr.includes(targetStr)) {
            matchFound = true;
        }
    }

    if (matchFound) {
        gameOver = true;
        statusEl.innerText = "ACCESS GRANTED";
        statusEl.classList.add("status-win");
        restartBtn.innerText = "SİSTEME GİRİŞ YAPILIYOR...";
        restartBtn.style.display = "block";

        setTimeout(() => {
            document.getElementById('projects').scrollIntoView();
        }, 1500);

    } else if (buffer.length >= bufferSize) {
        gameOver = true;
        statusEl.innerText = "BREACH FAILED";
        statusEl.classList.add("status-fail");
        restartBtn.innerText = "REBOOT SYSTEM";
        restartBtn.style.display = "block";
    }
}

initGame();
const chatWindow = document.getElementById('chatWindow');
const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');
const typingIndicator = document.getElementById('typingIndicator');

function toggleChat() {
    if (chatWindow.style.display === 'flex') {
        chatWindow.style.display = 'none';
    } else {
        chatWindow.style.display = 'flex';
        setTimeout(() => chatInput.focus(), 100);
    }
}

function handleEnter(e) {
    if (e.key === 'Enter') sendMessage();
}

function appendMessage(text, sender) {
    const div = document.createElement('div');
    div.className = sender === 'user' ? 'msg msg-user' : 'msg msg-ai';
    div.innerText = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
}

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    chatInput.value = '';

    typingIndicator.style.display = 'block';
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
        const response = await fetch('/php/chat.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });

        const data = await response.json();

        typingIndicator.style.display = 'none';

        if (data.reply) {
            appendMessage(data.reply, 'ai');
        } else if (data.error) {
            appendMessage(">> HATA: " + data.error, 'ai');
        }

    } catch (error) {
        typingIndicator.style.display = 'none';
        appendMessage(">> BAĞLANTI HATASI: Sunucu yanıt vermiyor.", 'ai');
        console.error('Chat Error:', error);
    }
}
