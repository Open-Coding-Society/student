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
        const selectedPassword = passwords[Math.floor(Math.random()*passwords.length)];
        let quizWindow = document.createElement("div");
        quizWindow.style = 'position: absolute; width: 50%; height: 50%; top: 25%; left: 25%; z-index: 999; background-color: black; border-width: 10px; border-style: solid; border-color: rgb(50, 50, 50) text-align: center; vertical-align: center; color: rgb(0, 255, 0); font-size: 3vh; font-family: "Sixtyfour", sans-serif; border-radius: 3vh;';
        quizWindow.id = "quizWindow";
        document.getElementById("gameContainer").appendChild(quizWindow);
        quizWindow.innerText = `Please decrypt alphanumeric password to continue: ${convertToAlphaNumeric(selectedPassword)}`;

        let typebox = document.createElement("div");
        typebox.style = 'position: absolute; width: 100%; height: 20%; bottom: 15%; background-color: black; font-size: auto; font-family: "Sixtyfour", sans-serif; font-size: 5vh; text-align: center; vertical-align: center; color: rgb(0, 255, 0);';
        typebox.innerText = ">";
        quizWindow.appendChild(typebox);

        window.addEventListener("keydown", function(event){
            if(event.key == 'Backspace' && typebox.innerText.length > 1){
                typebox.innerText = typebox.innerText.slice(0, -1);
                console.log(typebox.innerText.length);
            }else if(event.key == "Escape"){
                quizWindow.remove();
                quizzing = false;
            }else if(event.key == "Enter" || event.key == "Return"){
                if(typebox.innerText == selectedPassword){
                    quizWindow.innerText = `Password approved. You May now create a new user password`;
                    quizzing = false;
                    quizWindow.remove();

                }else{
                    typebox.style.color = "red";
                    typebox.innerText = ">TRY AGAIN";
                    setTimeout(() => {
                        typebox.innerText = ">";
                        typebox.style.color = "rgb(0, 255, 0)";
                    }, 1000);
                }
            }else if(event.key.length == 1 && typebox.innerText.length < 20){
                typebox.innerText += event.key.toLowerCase();
            }
        });
    }
}