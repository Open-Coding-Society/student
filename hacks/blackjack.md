<script>
const dealerCardsEl = document.getElementById("dealer-cards");
const playerCardsEl = document.getElementById("player-cards");
const dealerScoreEl = document.getElementById("dealer-score");
const playerScoreEl = document.getElementById("player-score");
const messageEl = document.getElementById("message");

const newGameBtn = document.getElementById("new-game-btn");
const hitBtn = document.getElementById("hit-btn");
const standBtn = document.getElementById("stand-btn");

let deck = [];
let playerHand = [];
let dealerHand = [];
let gameOver = false;

// ----- RED ADDITION: SIMPLE MONEY FEATURE -----
let playerMoney = 100; // starting money
let currentBet = 0;

const moneyEl = document.createElement("p");
moneyEl.style.color = "red"; // highlight in red
moneyEl.textContent = `Money: $${playerMoney}`;
document.getElementById("game-container").insertBefore(moneyEl, document.getElementById("game-controls"));

const betEl = document.createElement("input");
betEl.type = "number";
betEl.min = 1;
betEl.max = 1000;
betEl.value = 10; // default bet
betEl.style.margin = "5px";
document.getElementById("game-controls").insertBefore(betEl, newGameBtn);

const betBtn = document.createElement("button");
betBtn.textContent = "Place Bet";
betBtn.style.color = "red"; // highlight in red
document.getElementById("game-controls").insertBefore(betBtn, newGameBtn);

betBtn.addEventListener("click", () => {
    currentBet = parseInt(betEl.value);
    if (currentBet > playerMoney) {
        messageEl.textContent = "Not enough money!";
    } else {
        messageEl.textContent = `Bet placed: $${currentBet}`;
    }
});
// ----- END RED ADDITION -----

function createDeck() {
    const suits = ["♠", "♥", "♦", "♣"];
    const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
    let newDeck = [];
    for (let suit of suits) {
        for (let value of values) newDeck.push({value, suit});
    }
    return shuffle(newDeck);
}

function shuffle(deck) {
    for (let i = deck.length -1; i > 0; i--) {
        const j = Math.floor(Math.random()*(i+1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function getCardValue(card) {
    if (["J","Q","K"].includes(card.value)) return 10;
    if (card.value === "A") return 11;
    return parseInt(card.value);
}

function calculateHand(hand) {
    let value = 0, aceCount = 0;
    for (let card of hand) {
        value += getCardValue(card);
        if (card.value === "A") aceCount++;
    }
    while (value > 21 && aceCount > 0) { value -= 10; aceCount--; }
    return value;
}

function renderHand(hand, container, pointsContainer) {
    container.innerHTML = "";
    pointsContainer.innerHTML = "";
    for (let card of hand) {
        const cardEl = document.createElement("div");
        cardEl.classList.add("card");
        cardEl.textContent = `${card.value}${card.suit}`;
        cardEl.style.color = (card.suit==="♥"||card.suit==="♦")?"red":"black";
        container.appendChild(cardEl);
    }
    pointsContainer.textContent = calculateHand(hand);
}

function renderDealerInitial() {
    dealerCardsEl.innerHTML = "";
    const firstCard = dealerHand[0];
    const secondCard = dealerHand[1];

    // First card
    const cardEl1 = document.createElement("div");
    cardEl1.classList.add("card");
    cardEl1.textContent = `${firstCard.value}${firstCard.suit}`;
    cardEl1.style.color = (firstCard.suit==="♥"||firstCard.suit==="♦")?"red":"black";
    dealerCardsEl.appendChild(cardEl1);

    // Hidden second card
    const cardEl2 = document.createElement("div");
    cardEl2.classList.add("card");
    cardEl2.textContent = "🂠";
    dealerCardsEl.appendChild(cardEl2);

    document.getElementById("dealer-points").textContent = getCardValue(firstCard);
}

function updateScores() {
    dealerScoreEl.textContent = calculateHand(dealerHand);
    playerScoreEl.textContent = calculateHand(playerHand);
}

// ----- RED ADDITION: ADJUST MONEY BASED ON WIN/LOSE -----
function adjustMoney(result) {
    if (result === "win") playerMoney += currentBet;
    else if (result === "lose") playerMoney -= currentBet;
    moneyEl.textContent = `Money: $${playerMoney}`;
}
// ----- END RED ADDITION -----

function checkGameOver() {
    const playerValue = calculateHand(playerHand);
    const dealerValue = calculateHand(dealerHand);

    if (playerValue > 21) {
        messageEl.textContent = "You busted! Dealer wins.";
        gameOver = true;
        adjustMoney("lose"); // RED
    } else if (dealerValue > 21) {
        messageEl.textContent = "Dealer busted! You win!";
        gameOver = true;
        adjustMoney("win"); // RED
    } else if (gameOver) {
        if (playerValue > dealerValue) {
            messageEl.textContent = "You win!";
            adjustMoney("win"); // RED
        } else if (dealerValue > playerValue) {
            messageEl.textContent = "Dealer wins!";
            adjustMoney("lose"); // RED
        } else messageEl.textContent = "It's a tie!";
    }
}

function newGame() {
    if (currentBet <= 0 || currentBet > playerMoney) {
        messageEl.textContent = "Place a valid bet first!";
        return;
    }

    deck = createDeck();
    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];
    gameOver = false;

    renderHand(playerHand, playerCardsEl, document.getElementById("player-points"));
    renderDealerInitial();
    messageEl.textContent = "Game started. Your move!";
}

function hit() {
    if (gameOver) return;
    playerHand.push(deck.pop());
    renderHand(playerHand, playerCardsEl, document.getElementById("player-points"));
    if (calculateHand(playerHand) > 21) checkGameOver();
}

function stand() {
    if (gameOver) return;

    // Reveal dealer hidden card
    dealerCardsEl.children[1].textContent = `${dealerHand[1].value}${dealerHand[1].suit}`;
    dealerCardsEl.children[1].style.color = (dealerHand[1].suit==="♥"||dealerHand[1].suit==="♦") ? "red" : "black";

    // Recalculate dealer total after hidden card
    document.getElementById("dealer-points").textContent = calculateHand(dealerHand);

    // Dealer draws until 17 or more
    while (calculateHand(dealerHand) < 17) {
        const card = deck.pop();
        dealerHand.push(card);
        const cardEl = document.createElement("div");
        cardEl.classList.add("card");
        cardEl.textContent = `${card.value}${card.suit}`;
        cardEl.style.color = (card.suit==="♥"||card.suit==="♦")?"red":"black";
        dealerCardsEl.appendChild(cardEl);
        document.getElementById("dealer-points").textContent = calculateHand(dealerHand);
    }

    // Update final score
    updateScores();
    gameOver = true;
    checkGameOver();
}

newGameBtn.addEventListener("click", newGame);
hitBtn.addEventListener("click", hit);
standBtn.addEventListener("click", stand);
</script>