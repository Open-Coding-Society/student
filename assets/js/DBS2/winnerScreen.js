import Prompt from './Prompt.js';

// Winner screen removed — provide a tiny compatibility function that performs a popup.
export function showVictoryScreen() {
    try {
        Prompt.showDialoguePopup('System', 'Victory screen removed: you escaped!', () => {
            if (window.GameControl && typeof window.GameControl.stopTimer === 'function') {
                window.GameControl.stopTimer();
            }
        });
    } catch (e) {
        // If Prompt fails, log and stop timer
        console.warn('Prompt unavailable for victory screen', e);
        if (window.GameControl && typeof window.GameControl.stopTimer === 'function') {
            window.GameControl.stopTimer();
        }
    }
}