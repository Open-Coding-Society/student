import { updateCrypto, getCrypto } from "./StatsManager.js";

const Prompt = {
    isOpen: false,
    dim: false,
    currentNpc: null,
    initialized: false,
    
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

    // Ensure DOM elements exist before using them
    ensureElements() {
        // Create promptDropDown if it doesn't exist
        let promptDropDown = document.querySelector('.promptDropDown');
        if (!promptDropDown) {
            promptDropDown = document.createElement('div');
            promptDropDown.className = 'promptDropDown';
            promptDropDown.id = 'promptDropDown';
            promptDropDown.style.cssText = `
                position: fixed;
                background: rgba(20, 20, 20, 0.98);
                color: #fff;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.5);
                padding: 20px;
                display: none;
                z-index: 9999;
                max-height: 70vh;
                overflow-y: auto;
            `;
            document.body.appendChild(promptDropDown);
        }

        // Create promptTitle if it doesn't exist
        let promptTitle = document.getElementById('promptTitle');
        if (!promptTitle) {
            promptTitle = document.createElement('div');
            promptTitle.id = 'promptTitle';
            promptTitle.style.cssText = `
                font-size: 1.4em;
                font-weight: bold;
                margin-bottom: 16px;
                padding-bottom: 12px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                display: none;
            `;
            promptDropDown.appendChild(promptTitle);
        }

        this.initialized = true;
        return { promptDropDown, promptTitle };
    },
    
    backgroundDim: {
        create () {
            this.dim = true // sets the dim to be true when the prompt is opened
            console.log("CREATE DIM")
            // Remove existing dim if any
            const existingDim = document.getElementById("dim");
            if (existingDim) existingDim.remove();
            
            const dimDiv = document.createElement("div");
            dimDiv.id = "dim";
            dimDiv.style.backgroundColor = "black";
            dimDiv.style.width = "100%";
            dimDiv.style.height = "100%";
            dimDiv.style.position = "fixed";
            dimDiv.style.top = "0";
            dimDiv.style.left = "0";
            dimDiv.style.opacity = "0.8";
            document.body.append(dimDiv);
            dimDiv.style.zIndex = "9998"
            dimDiv.addEventListener("click", Prompt.backgroundDim.remove.bind(Prompt.backgroundDim))
        },
        remove () {
            this.dim = false
            console.log("REMOVE DIM");
            const dimDiv = document.getElementById("dim");
            if (dimDiv) {
                dimDiv.remove();
            }
            Prompt.isOpen = false;
            window.dialogueActive = false;
            const promptTitle = document.getElementById("promptTitle");
            if (promptTitle) {
                promptTitle.style.display = "none";
            }
            const promptDropDown = document.querySelector('.promptDropDown');
            if (promptDropDown) {
                promptDropDown.style.display = "none";
                promptDropDown.style.width = "0"; 
                promptDropDown.style.top = "0";  
                promptDropDown.style.left = "-100%"; 
            }
        },
    },

    createPromptDisplayTable() {
        const table = document.createElement("table");
        table.className = "table prompt";
        table.style.cssText = `
            width: 100%;
            border-collapse: collapse;
            color: #fff;
        `;
    
        // Header row for questions
        const header = document.createElement("tr");
        const th = document.createElement("th");
        th.colSpan = 2;
        th.innerText = "Answer the Questions Below:";
        th.style.cssText = `
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        `;
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
                questionCell.style.padding = "10px";
                row.appendChild(questionCell);
                const inputCell = document.createElement("td");
                inputCell.style.padding = "10px";
                const input = document.createElement("input");
                input.type = "text";
                input.placeholder = "Your answer here...";
                input.dataset.questionIndex = index;
                input.style.cssText = `
                    width: 100%;
                    padding: 8px;
                    border-radius: 4px;
                    border: 1px solid rgba(255,255,255,0.2);
                    background: rgba(0,0,0,0.3);
                    color: #fff;
                `;
                inputCell.appendChild(input);
                row.appendChild(inputCell);
                table.appendChild(row);
            });
            const submitRow = document.createElement("tr");
            const submitCell = document.createElement("td");
            submitCell.colSpan = 2;
            submitCell.style.textAlign = "center";
            submitCell.style.padding = "16px";
            const submitButton = document.createElement("button");
            submitButton.innerText = "Submit";
            submitButton.style.cssText = `
                padding: 10px 24px;
                border-radius: 6px;
                border: none;
                background: #4a90d9;
                color: #fff;
                font-weight: bold;
                cursor: pointer;
            `;
            submitButton.addEventListener("click", () => this.handleSubmit());
            submitCell.appendChild(submitButton);
            submitRow.appendChild(submitCell);
            table.appendChild(submitRow);
        } else {
            // Simple interaction: single textarea and submit
            const row = document.createElement("tr");
            const inputCell = document.createElement("td");
            inputCell.colSpan = 2;
            inputCell.style.padding = "10px";
            const textarea = document.createElement("textarea");
            textarea.placeholder = "Say something to this NPC...";
            textarea.style.cssText = `
                width: 100%;
                height: 80px;
                padding: 10px;
                border-radius: 6px;
                border: 1px solid rgba(255,255,255,0.2);
                background: rgba(0,0,0,0.3);
                color: #fff;
                resize: vertical;
            `;
            inputCell.appendChild(textarea);
            row.appendChild(inputCell);
            table.appendChild(row);
            const submitRow = document.createElement("tr");
            const submitCell = document.createElement("td");
            submitCell.colSpan = 2;
            submitCell.style.textAlign = "center";
            submitCell.style.padding = "16px";
            const submitButton = document.createElement("button");
            submitButton.innerText = "Submit";
            submitButton.style.cssText = `
                padding: 10px 24px;
                border-radius: 6px;
                border: none;
                background: #4a90d9;
                color: #fff;
                font-weight: bold;
                cursor: pointer;
            `;
            submitButton.addEventListener("click", () => this.handleSubmit());
            submitCell.appendChild(submitButton);
            submitRow.appendChild(submitCell);
            table.appendChild(submitRow);
        }
        // Wrap the table in a scrollable container
        const container = document.createElement("div");
        container.style.maxHeight = "400px"; // Limit height for scrollability
        container.style.overflowY = "auto"; // Enable vertical scrolling
        container.style.padding = "10px"; // Optional: add some padding
        container.appendChild(table);
        return container;
    },
        
    async handleSubmit() {
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
            const ta = document.querySelector('.promptDropDown textarea');
            if (ta) answers = [{ questionIndex: 0, answer: ta.value.trim() }];
        }

        console.log("Submitted Answers:", answers);

        // Handle IShowGreen: check player's crypto and allow escape if enough
        const npcId = this.currentNpc?.spriteData?.id;
        
        // Get player's crypto balance from StatsManager
        let playerCrypto = 0;
        try {
            playerCrypto = await getCrypto();
        } catch (e) {
            console.log('Could not get crypto balance:', e);
            playerCrypto = window.playerCrypto ?? window.playerBalance ?? 0;
        }
        
        let dialogue = '';
        let speaker = npcId || 'NPC';
        
        if (npcId === 'IShowGreen') {
            // Check for code scraps
            let hasAllScraps = false;
            let scrapCount = 0;
            try {
                if (window.Inventory) {
                    scrapCount = window.Inventory.getCodeScrapCount();
                    hasAllScraps = window.Inventory.hasAllCodeScraps();
                }
            } catch(e) {
                console.log('Could not check inventory:', e);
            }
            
            if (hasAllScraps) {
                // Player has all 5 pages - offer to present them
                Prompt.showCodeScrapChoice(playerCrypto, scrapCount);
                return; // Don't show normal dialogue
                
            } else if (playerCrypto >= 500) {
                // Player has enough crypto - offer to buy freedom
                Prompt.showCryptoWinChoice(playerCrypto);
                return; // Don't show normal dialogue
                
            } else if (scrapCount > 0) {
                dialogue = `${scrapCount} pages found. ${5 - scrapCount} still missing. Keep looking. Or earn ${500 - playerCrypto} more crypto.`;
            } else {
                dialogue = `You have ${playerCrypto} crypto. I need 500 to let you out. Or find my five pages. They are somewhere in this basement.`;
            }
        } else {
            // Generic handling for other NPCs: optionally award a small interaction reward
            const reward = Math.floor(Math.random() * 3); // small chance reward
            if (reward > 0) {
                try {
                    const newBal = await updateCrypto(reward);
                    dialogue = `You earned ${reward} Crypto. Total: ${newBal}`;
                } catch (e) {
                    console.log('Could not award crypto:', e);
                    dialogue = `You earned ${reward} Crypto!`;
                }
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
        // Auto-close any existing popup/dialogue
        let existingPopup = document.getElementById('dialoguePopup');
        if (existingPopup) existingPopup.remove();
        
        // Also close prompt panel if open
        if (this.isOpen) {
            this.backgroundDim.remove();
        }
        
        // Set dialogue active flag
        window.dialogueActive = true;
        
        let popup = document.createElement('div');
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
            window.dialogueActive = false;
            if (typeof onClose === 'function') onClose();
        };
        popup.appendChild(closeBtn);
        document.body.appendChild(popup);
    },

    // Intro dialogue that auto-advances (no close button)
    showIntroDialogue(speaker, text, duration = 4000, onComplete) {
        // Auto-close any existing popup/dialogue
        let existingPopup = document.getElementById('dialoguePopup');
        if (existingPopup) existingPopup.remove();
        
        window.dialogueActive = true;
        
        let popup = document.createElement('div');
        popup.id = 'dialoguePopup';
        popup.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 100%);
            color: #ccc;
            padding: 30px 35px;
            border-radius: 10px;
            border: 2px solid #0a5;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            z-index: 10001;
            min-width: 300px;
            max-width: 500px;
            text-align: center;
            font-family: 'Courier New', monospace;
        `;
        
        popup.innerHTML = `
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 12px; color: #0a5; letter-spacing: 1px;">${speaker.toUpperCase()}</div>
            <div style="font-size: 13px; line-height: 1.6; color: #aaa;">${text}</div>
            <div style="margin-top: 15px; height: 3px; background: #052; border-radius: 2px; overflow: hidden;">
                <div id="intro-progress" style="height: 100%; background: #0a5; width: 0%; transition: width ${duration}ms linear;"></div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Start progress bar animation
        setTimeout(() => {
            const progress = document.getElementById('intro-progress');
            if (progress) progress.style.width = '100%';
        }, 50);
        
        // Auto-close after duration
        setTimeout(() => {
            popup.remove();
            window.dialogueActive = false;
            if (typeof onComplete === 'function') onComplete();
        }, duration);
    },

    showConfirm(speaker, text, onConfirm, onCancel) {
        // Auto-close any existing popup/dialogue
        let existingPopup = document.getElementById('dialoguePopup');
        if (existingPopup) existingPopup.remove();
        
        // Also close prompt panel if open
        if (this.isOpen) {
            this.backgroundDim.remove();
        }
        
        // Set dialogue active flag
        window.dialogueActive = true;
        
        let popup = document.createElement('div');
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
        ok.onclick = () => { popup.remove(); window.dialogueActive = false; if (typeof onConfirm === 'function') onConfirm(); };

        const cancel = document.createElement('button');
        cancel.innerText = 'Cancel';
        cancel.style.padding = '8px 16px';
        cancel.style.borderRadius = '6px';
        cancel.style.border = 'none';
        cancel.style.cursor = 'pointer';
        cancel.onclick = () => { popup.remove(); window.dialogueActive = false; if (typeof onCancel === 'function') onCancel(); };

        btnRow.appendChild(ok);
        btnRow.appendChild(cancel);
        popup.appendChild(btnRow);
        document.body.appendChild(popup);
    },

    showCodeScrapChoice(playerCrypto, scrapCount) {
        // Close existing popups
        let existingPopup = document.getElementById('dialoguePopup');
        if (existingPopup) existingPopup.remove();
        
        if (this.isOpen) {
            this.backgroundDim.remove();
        }
        
        window.dialogueActive = true;
        
        let popup = document.createElement('div');
        popup.id = 'dialoguePopup';
        popup.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 100%);
            color: #ccc;
            padding: 30px;
            border-radius: 10px;
            border: 2px solid #0a5;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            z-index: 10001;
            min-width: 350px;
            max-width: 90vw;
            text-align: center;
            font-family: 'Courier New', monospace;
        `;
        
        popup.innerHTML = `
            <div style="font-weight: 700; margin-bottom: 10px; color: #0a5; font-size: 16px;">ISHOWGREEN</div>
            <div style="margin-bottom: 20px; line-height: 1.6; font-size: 13px;">
                All five pages. My code. You actually found them.
            </div>
            <div style="margin-bottom: 20px; color: #888; font-size: 12px; font-style: italic;">
                Hand them over and you can leave. Or you could keep them for yourself.
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <button id="present-scraps-btn" style="
                    background: #052;
                    color: #0a5;
                    border: 1px solid #0a5;
                    padding: 12px 20px;
                    cursor: pointer;
                    font-family: 'Courier New', monospace;
                    font-size: 13px;
                ">GIVE HIM THE PAGES</button>
                <button id="keep-scraps-btn" style="
                    background: #520;
                    color: #a50;
                    border: 1px solid #640;
                    padding: 12px 20px;
                    cursor: pointer;
                    font-family: 'Courier New', monospace;
                    font-size: 13px;
                ">KEEP THEM</button>
                <button id="cancel-choice-btn" style="
                    background: transparent;
                    color: #666;
                    border: 1px solid #333;
                    padding: 8px 20px;
                    cursor: pointer;
                    font-family: 'Courier New', monospace;
                    font-size: 11px;
                ">WALK AWAY</button>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Handle present choice - normal good ending
        document.getElementById('present-scraps-btn').onclick = () => {
            popup.remove();
            window.dialogueActive = false;
            
            Prompt.showDialoguePopup('IShowGreen', 'Finally. I can rebuild The Green Machine. The door is open. Leave before I change my mind.', () => {
                if (window.GameControl) {
                    window.GameControl.scrapWinTriggered = true;
                    window.GameControl.showWinScreen('scraps');
                }
            });
        };
        
        // Handle keep choice - alternate ending hook
        document.getElementById('keep-scraps-btn').onclick = () => {
            popup.remove();
            window.dialogueActive = false;
            
            // This is where an alternate ending could be added
            Prompt.showDialoguePopup('IShowGreen', 'What? No. Those are mine. I wrote them. Give them back.', () => {
                setTimeout(() => {
                    Prompt.showDialoguePopup('IShowGreen', 'You would steal from me? After everything?', () => {
                        setTimeout(() => {
                            Prompt.showDialoguePopup('System', 'Alternate ending not yet implemented. You leave with the pages. IShowGreen cannot stop you.', () => {
                                if (window.GameControl) {
                                    window.GameControl.showWinScreen('alternate');
                                }
                            });
                        }, 500);
                    });
                }, 500);
            });
        };
        
        // Handle cancel
        document.getElementById('cancel-choice-btn').onclick = () => {
            popup.remove();
            window.dialogueActive = false;
        };
    },

    showCryptoWinChoice(playerCrypto) {
        // Close existing popups
        let existingPopup = document.getElementById('dialoguePopup');
        if (existingPopup) existingPopup.remove();
        
        if (this.isOpen) {
            this.backgroundDim.remove();
        }
        
        window.dialogueActive = true;
        
        let popup = document.createElement('div');
        popup.id = 'dialoguePopup';
        popup.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 100%);
            color: #ccc;
            padding: 30px;
            border-radius: 10px;
            border: 2px solid #0a5;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            z-index: 10001;
            min-width: 350px;
            max-width: 90vw;
            text-align: center;
            font-family: 'Courier New', monospace;
        `;
        
        popup.innerHTML = `
            <div style="font-weight: 700; margin-bottom: 10px; color: #0a5; font-size: 16px;">ISHOWGREEN</div>
            <div style="margin-bottom: 20px; line-height: 1.6; font-size: 13px;">
                You have ${playerCrypto} crypto. That is more than enough.
            </div>
            <div style="margin-bottom: 20px; color: #888; font-size: 12px; font-style: italic;">
                Pay me 500 and the door opens. You walk free.
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <button id="pay-crypto-btn" style="
                    background: #052;
                    color: #0a5;
                    border: 1px solid #0a5;
                    padding: 12px 20px;
                    cursor: pointer;
                    font-family: 'Courier New', monospace;
                    font-size: 13px;
                ">PAY 500 CRYPTO</button>
                <button id="cancel-crypto-btn" style="
                    background: transparent;
                    color: #666;
                    border: 1px solid #333;
                    padding: 8px 20px;
                    cursor: pointer;
                    font-family: 'Courier New', monospace;
                    font-size: 11px;
                ">NOT YET</button>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Handle pay choice
        document.getElementById('pay-crypto-btn').onclick = () => {
            popup.remove();
            window.dialogueActive = false;
            
            Prompt.showDialoguePopup('IShowGreen', 'Done. The door is unlocked. Get out of my basement.', () => {
                setTimeout(() => {
                    if (window.GameControl) {
                        window.GameControl.cryptoWinTriggered = true;
                        window.GameControl.showWinScreen('crypto');
                    }
                }, 500);
            });
        };
        
        // Handle cancel
        document.getElementById('cancel-crypto-btn').onclick = () => {
            popup.remove();
            window.dialogueActive = false;
        };
    },

    updatePromptDisplay() {
        const { promptDropDown } = this.ensureElements();
        
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
        
        if (promptDropDown) {
            promptDropDown.append(this.updatePromptTable()) //update new Prompt
        }
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
        // Ensure DOM elements exist
        const { promptDropDown, promptTitle } = this.ensureElements();
        
        if (!promptDropDown) {
            console.error("Could not create promptDropDown element");
            return;
        }
        
        // Auto-close any existing dialogue popup
        let existingPopup = document.getElementById('dialoguePopup');
        if (existingPopup) {
            existingPopup.remove();
            window.dialogueActive = false;
        }
    
        // Close any existing prompt before opening a new one
        if (this.isOpen) {
            this.backgroundDim.remove(); // Ensures previous dim is removed
        }
        
        // Set dialogue active flag
        window.dialogueActive = true;
    
        this.currentNpc = npc; // Assign the current NPC when opening the panel
        this.isOpen = true;
    
        // Ensure the previous content inside promptDropDown is removed
        promptDropDown.innerHTML = ""; 
        
        // Re-create and add promptTitle since we cleared innerHTML
        const newTitle = document.createElement('div');
        newTitle.id = 'promptTitle';
        newTitle.style.cssText = `
            font-size: 1.4em;
            font-weight: bold;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            display: block;
        `;
        newTitle.innerHTML = npc?.spriteData?.id || "Interaction";
        promptDropDown.appendChild(newTitle);
    
        // Display the new questions
        promptDropDown.appendChild(this.updatePromptTable());
    
        // Handle the background dim effect
        this.backgroundDim.create();
    
        promptDropDown.style.display = "block";
        promptDropDown.style.position = "fixed";
        promptDropDown.style.zIndex = "9999";
        promptDropDown.style.width = "70%"; 
        promptDropDown.style.top = "15%";
        promptDropDown.style.left = "15%"; 
        promptDropDown.style.transition = "all 0.3s ease-in-out"; 
    },
    
    initializePrompt() {
        console.log("Initializing prompt system");
        this.ensureElements();
        console.log("Prompt system initialized successfully");
    },
};

export default Prompt;