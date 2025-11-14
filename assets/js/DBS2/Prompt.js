import { updateBalance } from "./StatsManager.js";

const Prompt = {
    isOpen: false,
    dim: false,
    currentNpc: null,
    
    // Keep this function for other uses, but we won't use it for questions
    shuffleArray(array) {
        if (!array || array.length === 0) return [];
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    },
    
    // Helper function to normalize answers for comparison
    normalizeAnswer(answer) {
        if (!answer) return "";
        return answer.trim();
    },
    
    backgroundDim: {
        create () {
            this.dim = true // sets the dim to be true when the prompt is opened
            console.log("CREATE DIM")
            const dimDiv = document.createElement("div");
            dimDiv.id = "dim";
            dimDiv.style.backgroundColor = "black";
            dimDiv.style.width = "100%";
            dimDiv.style.height = "100%";
            dimDiv.style.position = "absolute";
            dimDiv.style.opacity = "0.8";
            document.body.append(dimDiv);
            dimDiv.style.zIndex = "9998"
            dimDiv.addEventListener("click", Prompt.backgroundDim.remove)
        },
        remove () {
            this.dim = false
            console.log("REMOVE DIM");
            const dimDiv = document.getElementById("dim");
            if (dimDiv) {
                dimDiv.remove();
            }
            Prompt.isOpen = false;
            const promptTitle = document.getElementById("promptTitle");
            if (promptTitle) {
                promptTitle.style.display = "none";
            }
            const promptDropDown = document.querySelector('.promptDropDown');
            if (promptDropDown) {
                promptDropDown.style.width = "0"; 
                promptDropDown.style.top = "0";  
                promptDropDown.style.left = "-100%"; 
                promptDropDown.style.transition = "all 0.3s ease-in-out";
            }
        },
    },

    createPromptDisplayTable() {
        const table = document.createElement("table");
        table.className = "table prompt";
    
        // Header row for questions
        const header = document.createElement("tr");
        const th = document.createElement("th");
        th.colSpan = 2;
        th.innerText = "Answer the Questions Below:";
        header.appendChild(th);
        table.appendChild(header);
    
        return table;
    },
    
    toggleDetails() {
        Prompt.detailed = !Prompt.detailed;
        Prompt.updatePromptDisplay();
    },

    updatePromptTable() {
        const table = this.createPromptDisplayTable();
        // Use `currentNpc` to populate questions
        if (this.currentNpc && this.currentNpc.questions) {
            this.currentNpc.questions.forEach((question, index) => {
                const row = document.createElement("tr");
                // Question cell
                const questionCell = document.createElement("td");
                questionCell.innerText = `${index + 1}. ${question}`;
                row.appendChild(questionCell);
                // Input cell
                const inputCell = document.createElement("td");
                const input = document.createElement("input");
                input.type = "text";
                input.placeholder = "Your answer here...";
                input.dataset.questionIndex = index; // Tag input with the question index
                inputCell.appendChild(input);
                row.appendChild(inputCell);
                table.appendChild(row);
            });
            // Add submit button
            const submitRow = document.createElement("tr");
            const submitCell = document.createElement("td");
            submitCell.colSpan = 2;
            submitCell.style.textAlign = "center";
            const submitButton = document.createElement("button");
            submitButton.innerText = "Submit";
            submitButton.addEventListener("click", this.handleSubmit.bind(this)); // Attach submission handler
            submitCell.appendChild(submitButton);
            submitRow.appendChild(submitCell);
            table.appendChild(submitRow);
        } else {
            const row = document.createElement("tr");
            const noQuestionsCell = document.createElement("td");
            noQuestionsCell.colSpan = 2;
            noQuestionsCell.innerText = "No questions available.";
            row.appendChild(noQuestionsCell);
            table.appendChild(row);
        }
        // Wrap the table in a scrollable container
        const container = document.createElement("div");
        container.style.maxHeight = "400px"; // Limit height for scrollability
        container.style.overflowY = "auto"; // Enable vertical scrolling
        container.style.border = "1px solid #ccc"; // Optional: add a border
        container.style.padding = "10px"; // Optional: add some padding
        container.appendChild(table);
        return container;
    },
        
    handleSubmit() {
        // Collect all answers
        const inputs = document.querySelectorAll("input[type='text']");
        const answers = Array.from(inputs).map(input => ({
            questionIndex: parseInt(input.dataset.questionIndex),
            answer: input.value.trim()
        }));
        
        console.log("Submitted Answers:", answers);
        
        // Check if this is IShowGreen's quiz (for game ending)
        if (this.currentNpc && this.currentNpc.spriteData.id === 'IShowGreen') {
            // Check if the player answered "yes" to the first question
            if (answers.length > 0 && 
                answers[0].questionIndex === 0 && 
                this.normalizeAnswer(answers[0].answer).toLowerCase() === "yes") {
                
                // Check player's balance
                const playerBalance = window.playerBalance || 0;
                
                if (playerBalance >= 250) {
                    // Player has enough money to escape - trigger victory
                    import('./winnerScreen.js')
                        .then(module => {
                            module.showVictoryScreen();
                        })
                        .catch(err => {
                            console.error("Error showing victory screen:", err);
                            alert("You've escaped the basement! (But there was an error showing the victory screen)");
                        });
                } else {
                    // Not enough money
                    alert(`"Not so fast! You need 250 money bucks to escape, but you only have ${playerBalance}. Keep hustling!"`);
                }
            } else {
                // Player didn't answer "yes"
                alert("Come back when you're ready to leave... and have the money!");
            }
        }
        // Check if this is Computer2's quiz
        else if (this.currentNpc && this.currentNpc.spriteData.id === 'Computer2') {
            // Import the computer2answers for grading
            import('./computer2answers.js')
                .then(module => {
                    const correctAnswers = module.default;
                    let correctCount = 0;
                    let userAnswers = [];
                    
                    // Compare user answers with correct answers
                    answers.forEach(answer => {
                        const questionIndex = answer.questionIndex;
                        userAnswers[questionIndex] = answer.answer;
                        
                        if (questionIndex < correctAnswers.length) {
                            // Compare the answers (case-sensitive for exact matches)
                            if (this.normalizeAnswer(answer.answer) === this.normalizeAnswer(correctAnswers[questionIndex])) {
                                correctCount++;
                            }
                        }
                    });
                    
                    // Save user answers for stats tracking (optional)
                    if (typeof window.savePlayerAnswers === 'function') {
                        window.savePlayerAnswers(userAnswers);
                    }
                    
                    // Award points based on correct answers
                    const pointsPerCorrectAnswer = Math.floor(Math.random()*5) + 10; // temp
                    const totalPoints = correctCount * pointsPerCorrectAnswer;
                    
                    // Update the balance using StatsManager function
                    const newBalance = updateBalance(totalPoints);
                    
                    // Show feedback to the player
                    alert(`Well done. You got ${correctCount} out of ${correctAnswers.length} correct.\nYou earned ${totalPoints} dollars!\nYour total money is now ${newBalance}.`);
                })
                .catch(err => {
                    console.error("Error grading quiz:", err);
                    alert("There was an error grading your quiz. Please try again.");
                });
        } else {
            // For other NPCs, just show a generic message
            alert("Answers submitted!");
        }
        
        // Close the prompt
        this.isOpen = false;
        this.backgroundDim.remove();
    },
    updatePromptDisplay() {
        const table = document.getElementsByClassName("table scores")[0]
        const detailToggleSection = document.getElementById("detail-toggle-section")
        const clearButtonRow = document.getElementById("clear-button-row")
        const pagingButtonsRow = document.getElementById("paging-buttons-row")

        if (detailToggleSection) {
            detailToggleSection.remove()
        }

        if (table) {
            table.remove() //remove old table if it is there
        }

        if (pagingButtonsRow) {
            pagingButtonsRow.remove()
        }

        if (clearButtonRow) {
            clearButtonRow.remove()
        }
        
        document.getElementById("promptDropDown").append(this.updatePromptTable()) //update new Prompt
    },

    backPage() {
        const table = document.getElementsByClassName("table scores")[0]

        if (this.currentPage - 1 == 0) {
            return;
        }
    
        this.currentPage -= 1
        this.updatePromptDisplay()
    },
    
    frontPage() {
        this.currentPage += 1
        this.updatePromptDisplay()
    },

    openPromptPanel(npc) {
        const promptDropDown = document.querySelector('.promptDropDown');
        const promptTitle = document.getElementById("promptTitle");
    
        // Close any existing prompt before opening a new one
        if (this.isOpen) {
            this.backgroundDim.remove(); // Ensures previous dim is removed
        }
    
        this.currentNpc = npc; // Assign the current NPC when opening the panel
        this.isOpen = true;
    
        // Ensure the previous content inside promptDropDown is removed
        promptDropDown.innerHTML = ""; 
        
        promptTitle.style.display = "block";

        // Add the new title
        promptTitle.innerHTML = npc.quiz.title || "Questions";
        promptDropDown.appendChild(promptTitle);
    
        // Display the new questions
        promptDropDown.appendChild(this.updatePromptTable());
    
        // Handle the background dim effect
        this.backgroundDim.create();
    
        promptDropDown.style.position = "fixed";
        promptDropDown.style.zIndex = "9999";
        promptDropDown.style.width = "70%"; 
        promptDropDown.style.top = "15%";
        promptDropDown.style.left = "15%"; 
        promptDropDown.style.transition = "all 0.3s ease-in-out"; 
    },
    
    initializePrompt() {
        console.log("Initializing prompt system");
        const promptTitle = document.createElement("div");
        promptTitle.id = "promptTitle";
        
        const promptDropDown = document.getElementById("promptDropDown");
        if (promptDropDown) {
            promptDropDown.appendChild(promptTitle);
            console.log("Prompt system initialized successfully");
        } else {
            console.error("Could not find promptDropDown element");
        }
    },
};

export default Prompt;