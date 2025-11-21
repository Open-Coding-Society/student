import GameLevelBasement from './GameLevelBasement.js';
import Prompt from './Prompt.js';

let currentKey = "";
let nextKeyChange = 0;


function randomKey(){
const keys = "ASDFJKLQWERUIOP";
return keys[Math.floor(Math.random() * keys.length)];
}


async function updateState(){
const res = await fetch('/state');
const data = await res.json();
document.getElementById('coin').textContent = data.active_coin;
document.getElementById('pct').textContent = data.percent_change;
document.getElementById('progress').textContent = data.player_progress;
}


async function sendHits(count){
const res = await fetch('/mine', {
method: 'POST',
headers: { 'content-type':'application/json' },
body: JSON.stringify({ hits: count })
});
const data = await res.json();
	if(data.finished){
		try { Prompt.showDialoguePopup('Miner', data.message); } catch (e) { console.warn(data.message); }
	} else {
		document.getElementById('progress').textContent = data.progress;
	}
}


function loop(){
const now = Date.now();
if(now > nextKeyChange){
currentKey = randomKey();
nextKeyChange = now + (2000 + Math.random() * 5000); // 2–7 sec
document.getElementById('key').textContent = currentKey;
}
requestAnimationFrame(loop);
}


window.addEventListener('keydown', (e) => {
if(e.key.toUpperCase() === currentKey){
sendHits(1);
}
});


setInterval(updateState, 2000);
updateState();
loop();