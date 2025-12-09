import { updateCrypto, completeMinigame } from './StatsManager.js';
import { pythonURI, fetchOptions } from '../api/config.js';
import Prompt from './Prompt.js';

let quizzing = false;

let passwords = [
    "ishowgreen",
    "helloworld",
    "albuquerque",
    "ilovebitcoin",
    "cryptorules",
    "unemployment",
];

function convertToAlphaNumeric(str){
    let newString = "";
    for (let i = 0; i < str.length; i++){
        newString += str.charCodeAt(i) - 96;
        newString += "/"
    }
    return newString;
}

export default function infiniteUserMinigame(){
    if(!quizzing){
        quizzing = true;
        window.infiniteUserActive = true;
        window.minigameActive = true;
        
        let creatingNew = false;
        let isFirstCompletion = false;
        
        // Check if first completion
        async function checkFirstCompletion() {
            try {
                if (typeof window.DBS2API !== 'undefined') {
                    const status = await window.DBS2API.getMinigameStatus();
                    isFirstCompletion = !status.infinite_user;
                }
            } catch (e) {
                console.log('Could not check minigame status:', e);
            }
        }
        checkFirstCompletion();
        
        const selectedPassword = passwords[Math.floor(Math.random()*passwords.length)];
        let quizWindow = document.createElement("div");
        quizWindow.style = 'position: fixed; width: 50%; height: 50%; top: 25%; left: 25%; z-index: 10000; background-color: black; border-width: 10px; border-style: solid; border-color: rgb(50, 50, 50); text-align: center; vertical-align: center; color: rgb(0, 255, 0); font-size: 3vh; font-family: "Sixtyfour", monospace; border-radius: 3vh;';
        quizWindow.id = "quizWindow";
        document.body.appendChild(quizWindow);
        
        let messageDiv = document.createElement("div");
        messageDiv.style = 'width: 100%; height: 60%; padding-top: 2vh; color: rgb(0, 255, 0);';
        messageDiv.innerText = `Please decrypt alphanumeric password to continue: ${convertToAlphaNumeric(selectedPassword)}`;
        quizWindow.appendChild(messageDiv);

        let typebox = document.createElement("div");
        typebox.style = 'position: absolute; width: 100%; height: 20%; bottom: 15%; background-color: black; font-size: auto; font-family: "Sixtyfour", monospace; font-size: 5vh; text-align: center; vertical-align: center; color: rgb(0, 255, 0);';
        typebox.innerText = ">";
        quizWindow.appendChild(typebox);
        
        let closeBtn = document.createElement("button");
        closeBtn.innerText = "✕ Close (ESC)";
        closeBtn.style = 'position: absolute; top: 10px; right: 10px; background: #f00; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 14px;';
        closeBtn.onclick = closeMinigame;
        quizWindow.appendChild(closeBtn);
        
        function closeMinigame() {
            quizWindow.remove();
            quizzing = false;
            window.infiniteUserActive = false;
            window.minigameActive = false;
            window.removeEventListener("keydown", keyHandler, true);
        }
        
        async function completeWithReward() {
            // Calculate reward
            let reward = 15 + Math.floor(Math.random() * 10); // 15-24 crypto
            
            // First completion bonus
            if (isFirstCompletion) {
                reward += 20;
            }
            
            updateCrypto(reward);
            
            // Mark minigame as complete
            try {
                await completeMinigame('infinite_user');
            } catch (e) {
                console.log('Could not save minigame completion:', e);
            }
            
            let message = `New user password created. You earned ${reward} Crypto!`;
            if (isFirstCompletion) {
                message += ' (includes +20 first completion bonus!)';
            }
            
            messageDiv.innerText = message;
            passwords.push(typebox.innerText.slice(1, typebox.innerText.length));
            passwords.splice(0, 1);
            
            setTimeout(() => {
                closeMinigame();
                try {
                    Prompt.showDialoguePopup('Computer1', message);
                } catch(e) {
                    console.log(message);
                }
            }, 1500);
        }

        function keyHandler(event) {
            event.preventDefault();
            event.stopPropagation();
            
            if(event.key == 'Backspace' && typebox.innerText.length > 1){
                typebox.innerText = typebox.innerText.slice(0, -1);
            }else if(event.key == "Escape"){
                closeMinigame();
            }else if(event.key == "Enter" || event.key == "Return"){
                if(creatingNew){
                    completeWithReward();
                }else{
                    if(typebox.innerText.slice(1, typebox.innerText.length) == selectedPassword){
                        messageDiv.innerText = `Password approved. You may now move on.`;
                        setTimeout(() => {
                            creatingNew = true;
                            messageDiv.innerText = `Create a new user password:`;
                            typebox.innerText = ">";
                        }, 1000);
                    }else{
                        typebox.style.color = "red";
                        typebox.innerText = ">TRY AGAIN";
                        setTimeout(() => {
                            typebox.innerText = ">";
                            typebox.style.color = "rgb(0, 255, 0)";
                        }, 1000);
                    }
                }
            }else if(event.key.length == 1 && typebox.innerText.length < 20 && /^[a-z]$/i.test(event.key[0])){
                typebox.innerText += event.key.toLowerCase();
            }
        }
        
        window.addEventListener("keydown", keyHandler, true);
    }
}