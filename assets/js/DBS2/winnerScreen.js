// Winner screen removed — provide a tiny compatibility function that performs a simple alert.
export function showVictoryScreen() {
    alert('Victory screen removed: you escaped!');
    if (window.GameControl && typeof window.GameControl.stopTimer === 'function') {
        window.GameControl.stopTimer();
    }
}