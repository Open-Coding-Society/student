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
        // If the NPC provides questions (legacy), show them; otherwise show a simple interaction input.
        if (this.currentNpc && this.currentNpc.questions && this.currentNpc.questions.length > 0) {
            this.currentNpc.questions.forEach((question, index) => {
                const row = document.createElement("tr");
                const questionCell = document.createElement("td");
                questionCell.innerText = `${index + 1}. ${question}`;
                row.appendChild(questionCell);
                const inputCell = document.createElement("td");
                const input = document.createElement("input");
                input.type = "text";
                input.placeholder = "Your answer here...";
                input.dataset.questionIndex = index;
                inputCell.appendChild(input);
                row.appendChild(inputCell);
                table.appendChild(row);
            });
            const submitRow = document.createElement("tr");
            const submitCell = document.createElement("td");
            submitCell.colSpan = 2;
            submitCell.style.textAlign = "center";
            const submitButton = document.createElement("button");
            submitButton.innerText = "Submit";
            submitButton.addEventListener("click", this.handleSubmit.bind(this));
            submitCell.appendChild(submitButton);
            submitRow.appendChild(submitCell);
            table.appendChild(submitRow);
        } else {
            // Simple interaction: single textarea and submit
            const row = document.createElement("tr");
            const inputCell = document.createElement("td");
            inputCell.colSpan = 2;
            const textarea = document.createElement("textarea");
            textarea.placeholder = "Say something to this NPC...";
            textarea.style.width = "100%";
            textarea.style.height = "8vh";
            inputCell.appendChild(textarea);
            row.appendChild(inputCell);
            table.appendChild(row);
            const submitRow = document.createElement("tr");
            const submitCell = document.createElement("td");
            submitCell.colSpan = 2;
            submitCell.style.textAlign = "center";
            const submitButton = document.createElement("button");
            submitButton.innerText = "Submit";
            submitButton.addEventListener("click", this.handleSubmit.bind(this));
            submitCell.appendChild(submitButton);
            submitRow.appendChild(submitCell);
            table.appendChild(submitRow);
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
        // Try to read text inputs first (legacy quizzes)
        const inputs = document.querySelectorAll("input[type='text']");
        let answers = [];
        if (inputs && inputs.length > 0) {
            answers = Array.from(inputs).map(input => ({
                questionIndex: parseInt(input.dataset.questionIndex),
                answer: input.value.trim()
            }));
        } else {
            // If no inputs, read textarea (simple interaction)
            const ta = document.querySelector('textarea');
            if (ta) answers = [{ questionIndex: 0, answer: ta.value.trim() }];
        }

        console.log("Submitted Answers:", answers);

        // Handle IShowGreen: check player's crypto and allow escape if enough
        const npcId = this.currentNpc?.spriteData?.id;
        const playerCrypto = window.playerCrypto ?? window.playerBalance ?? 0;
        let dialogue = '';
        let speaker = npcId || 'NPC';
        if (npcId === 'IShowGreen') {
            if (playerCrypto >= 250) {
                dialogue = "You've escaped the basement! Congratulations — freedom is yours.";
                if (window.GameControl && typeof window.GameControl.stopTimer === 'function') {
                    window.GameControl.stopTimer();
                }
            } else {
                dialogue = `Not so fast! You need 250 Crypto to escape, but you only have ${playerCrypto}. Keep hustling!`;
            }
        } else {
            // Generic handling for other NPCs: optionally award a small interaction reward
            const reward = Math.floor(Math.random() * 3); // small chance reward
            if (reward > 0) {
                const newBal = updateBalance(reward);
                dialogue = `You earned ${reward} Crypto. Total: ${newBal}`;
            } else {
                dialogue = 'Interaction recorded.';
            }
        }
        // Show the dialogue popup
        Prompt.showDialoguePopup(speaker, dialogue, () => {
            // On close, close the prompt and remove dim
            Prompt.isOpen = false;
            Prompt.backgroundDim.remove();
        });
    },

    showDialoguePopup(speaker, text, onClose) {
        // Remove any existing popup
        let popup = document.getElementById('dialoguePopup');
        if (popup) popup.remove();
        popup = document.createElement('div');
        popup.id = 'dialoguePopup';
        popup.style.position = 'fixed';
        popup.style.left = '50%';
        popup.style.top = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.background = 'rgba(24,24,24,0.98)';
        popup.style.color = '#fff';
        popup.style.padding = '32px 24px 18px 24px';
        popup.style.borderRadius = '12px';
        popup.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)';
        popup.style.zIndex = '10001';
        popup.style.minWidth = '260px';
        popup.style.maxWidth = '90vw';
        popup.style.textAlign = 'center';
        popup.innerHTML = `<div style="font-weight:700;font-size:1.2em;margin-bottom:0.5em;">${speaker}</div><div style="margin-bottom:1.2em;">${text}</div>`;
        const closeBtn = document.createElement('button');
        closeBtn.innerText = 'Close';
        closeBtn.style.padding = '8px 18px';
        closeBtn.style.borderRadius = '6px';
        closeBtn.style.background = '#222';
        closeBtn.style.color = '#fff';
        closeBtn.style.border = 'none';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = () => {
            popup.remove();
            if (typeof onClose === 'function') onClose();
        };
        popup.appendChild(closeBtn);
        document.body.appendChild(popup);
    },
    showConfirm(speaker, text, onConfirm, onCancel) {
        // Remove any existing popup
        let popup = document.getElementById('dialoguePopup');
        if (popup) popup.remove();
        popup = document.createElement('div');
        popup.id = 'dialoguePopup';
        popup.style.position = 'fixed';
        popup.style.left = '50%';
        popup.style.top = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.background = 'rgba(24,24,24,0.98)';
        popup.style.color = '#fff';
        popup.style.padding = '24px';
        popup.style.borderRadius = '10px';
        popup.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)';
        popup.style.zIndex = '10001';
        popup.style.minWidth = '260px';
        popup.style.maxWidth = '90vw';
        popup.style.textAlign = 'center';
        popup.innerHTML = `<div style="font-weight:700;margin-bottom:0.5em;">${speaker}</div><div style="margin-bottom:1em;">${text}</div>`;
        const btnRow = document.createElement('div');
        btnRow.style.display = 'flex';
        btnRow.style.justifyContent = 'center';
        btnRow.style.gap = '12px';

        const ok = document.createElement('button');
        ok.innerText = 'OK';
        ok.style.padding = '8px 16px';
        ok.style.borderRadius = '6px';
        ok.style.border = 'none';
        ok.style.cursor = 'pointer';
        ok.onclick = () => { popup.remove(); if (typeof onConfirm === 'function') onConfirm(); };

        const cancel = document.createElement('button');
        cancel.innerText = 'Cancel';
        cancel.style.padding = '8px 16px';
        cancel.style.borderRadius = '6px';
        cancel.style.border = 'none';
        cancel.style.cursor = 'pointer';
        cancel.onclick = () => { popup.remove(); if (typeof onCancel === 'function') onCancel(); };

        btnRow.appendChild(ok);
        btnRow.appendChild(cancel);
        popup.appendChild(btnRow);
        document.body.appendChild(popup);
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

        // Add the new title (use NPC id or a generic label)
        promptTitle.innerHTML = npc?.spriteData?.id || "Interaction";
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