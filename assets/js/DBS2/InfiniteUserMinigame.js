let quizzing = false;

let passwords = [ // THIS SHOULD PULL FROM THE BACKEND BUT IS CURRENTLY JUST A PLACEHOLDER
    "ishowgreen",
    "helloworld",
    "albuquerque",
    "ilovebitcoin",
    "cryptorules",
    "unemployment",
]

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
        let creatingNew = false;
        const selectedPassword = passwords[Math.floor(Math.random()*passwords.length)];
        let quizWindow = document.createElement("div");
        quizWindow.style = 'position: absolute; width: 50%; height: 50%; top: 25%; left: 25%; z-index: 999; background-color: black; border-width: 10px; border-style: solid; border-color: rgb(50, 50, 50) text-align: center; vertical-align: center; color: rgb(0, 255, 0); font-size: 3vh; font-family: "Sixtyfour", sans-serif; border-radius: 3vh;';
        quizWindow.id = "quizWindow";
        document.getElementById("gameContainer").appendChild(quizWindow);
        // messageDiv holds the changing text so replacing it doesn't remove other children
        let messageDiv = document.createElement("div");
        messageDiv.style = 'width: 100%; height: 60%; padding-top: 2vh; color: rgb(0, 255, 0);';
        messageDiv.innerText = `Please decrypt alphanumeric password to continue: ${convertToAlphaNumeric(selectedPassword)}`;
        quizWindow.appendChild(messageDiv);

        let typebox = document.createElement("div");
        typebox.style = 'position: absolute; width: 100%; height: 20%; bottom: 15%; background-color: black; font-size: auto; font-family: "Sixtyfour", sans-serif; font-size: 5vh; text-align: center; vertical-align: center; color: rgb(0, 255, 0);';
        typebox.innerText = ">";
        quizWindow.appendChild(typebox);

        let clicklistener = window.addEventListener("keydown", function(event){
            if(event.key == 'Backspace' && typebox.innerText.length > 1){
                typebox.innerText = typebox.innerText.slice(0, -1);
                console.log(typebox.innerText.length);
            }else if(event.key == "Escape"){
                quizWindow.remove();
                quizzing = false;
                this.window.removeEventListener("keydown", clicklistener);
            }else if(event.key == "Enter" || event.key == "Return"){
                if(creatingNew){
                    messageDiv.innerText = `New user password created. Goodbye!`;
                    passwords.push(typebox.innerText.slice(1, typebox.innerText.length));
                    passwords.splice(0, 1);
                    setTimeout(() => {
                        this.window.removeEventListener("keydown", clicklistener);
                        quizWindow.remove();
                        quizzing = false;
                    }, 1000);
                }else{
                    if(typebox.innerText.slice(1, typebox.innerText.length) == selectedPassword){
                        messageDiv.innerText = `Password approved. You may now move on.`;
                        setTimeout(() => {
                            creatingNew = true;
                            messageDiv.innerText = `Create a new user password:`;
                            typebox.innerText = ">";
                        }, 1000);
                    }else{
                        console.log(typebox.innerText.slice(1, typebox.innerText.length), selectedPassword);
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
        });
    }
}