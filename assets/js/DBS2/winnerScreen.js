// Create and export a function to display the win screen

export function showVictoryScreen() {
    // Create the victory screen container
    const victoryScreen = document.createElement("div");
    victoryScreen.id = "victoryScreen";
    victoryScreen.style.position = "fixed";
    victoryScreen.style.top = "0";
    victoryScreen.style.left = "0";
    victoryScreen.style.width = "100%";
    victoryScreen.style.height = "100%";
    victoryScreen.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
    victoryScreen.style.display = "flex";
    victoryScreen.style.flexDirection = "column";
    victoryScreen.style.justifyContent = "center";
    victoryScreen.style.alignItems = "center";
    victoryScreen.style.zIndex = "10000";
    victoryScreen.style.color = "white";
    victoryScreen.style.fontFamily = '"Sixtyfour", sans-serif';
    
    // Create the victory message
    const message = document.createElement("h1");
    message.textContent = "FREEDOM AT LAST!";
    message.style.fontSize = "5vw";
    message.style.marginBottom = "20px";
    message.style.textAlign = "center";
    message.style.textShadow = "0 0 10px #00ff00, 0 0 20px #00ff00";
    
    // Create the secondary message
    const subMessage = document.createElement("p");
    subMessage.textContent = "You escaped IShowGreen's basement with your sanity intact!";
    subMessage.style.fontSize = "2vw";
    subMessage.style.marginBottom = "40px";
    subMessage.style.textAlign = "center";
    
    // Create a "Play Again" button
    const playAgainButton = document.createElement("button");
    playAgainButton.textContent = "Play Again";
    playAgainButton.style.padding = "15px 30px";
    playAgainButton.style.fontSize = "1.5vw";
    playAgainButton.style.backgroundColor = "#00ff00";
    playAgainButton.style.color = "black";
    playAgainButton.style.border = "none";
    playAgainButton.style.borderRadius = "5px";
    playAgainButton.style.cursor = "pointer";
    playAgainButton.style.fontFamily = '"Sixtyfour", sans-serif';
    playAgainButton.style.marginTop = "20px";
    
    // Add click event to reload the page
    playAgainButton.addEventListener("click", () => {
        location.reload();
    });
    
    // Add all elements to the victory screen
    victoryScreen.appendChild(message);
    victoryScreen.appendChild(subMessage);
    victoryScreen.appendChild(playAgainButton);
    
    // Add victory screen to the document
    document.body.appendChild(victoryScreen);
    
    // Try to play victory sound with better error handling and path options
    try {
        const victorySound = new Audio();
        // Try different possible paths to find the audio file
        const possiblePaths = [
            "assets/js/adventureGame/victory.mp3",
            "/assets/js/adventureGame/victory.mp3",
            "../assets/js/adventureGame/victory.mp3",
            "../../assets/js/adventureGame/victory.mp3",
            "./victory.mp3"
        ];
        
        // Function to try the next path
        const tryPath = (index) => {
            if (index >= possiblePaths.length) {
                console.log("Could not find victory sound file in any expected location.");
                return;
            }
            
            victorySound.src = possiblePaths[index];
            victorySound.volume = 0.7;
            
            victorySound.oncanplaythrough = () => {
                console.log("Victory sound loaded successfully from: " + possiblePaths[index]);
                victorySound.play()
                    .catch(error => console.log("Audio couldn't play automatically:", error));
            };
            
            victorySound.onerror = () => {
                console.log("Failed to load audio from: " + possiblePaths[index]);
                tryPath(index + 1);
            };
        };
        
        // Start trying paths
        tryPath(0);
    } catch (error) {
        console.log("Error setting up victory sound:", error);
    }
    
    // Stop the game timer and any background music
    if (window.GameControl && typeof window.GameControl.stopTimer === 'function') {
        window.GameControl.stopTimer();
    }
}