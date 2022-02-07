const pageBody = document.querySelector('body');
const renderScreen = document.getElementById('screen');

const ball = document.getElementById('circle0');
let ballSize = 40;

const originX = 0;
const originY = 0;

const screenWidth = 720;
const screenHeight = 480;

let play = true;

window.onload = () => {
	
	const refreshRate = 1000 / 30;
	
	startGameStructure();

};

function startGameStructure() {
	
	let positionX = 20, positionY = 200;
	let velocityX = 2, velocityY = 1;

	function step() {
		
		if (play) {
			
			positionX = positionX + velocityX;
			positionY = positionY + velocityY;
			
			if (positionX > screenWidth - ballSize || positionX < 0) {
				velocityX = velocityX * (-1);
			}
			
			if (positionY > screenHeight - ballSize) {
				velocityY = velocityY * (-1);
			}
			else velocityY++;
			
			ball.style.left = clamp(0, screenWidth - ballSize, positionX) + 'px';
			ball.style.top = min(positionY, screenHeight - ballSize) + 'px';
			
		}
		
		window.requestAnimationFrame(step);
	}
	
	window.requestAnimationFrame(step);
}

window.onclick = () => {
	
	play = !play;
	console.log("Play state set to " + play);
	
	if (play) renderScreen.style.backgroundColor = '#FFFFFF';
	else  renderScreen.style.backgroundColor = '#D0D0D0';
	
};

function min(val1, val2) {
	if (val1 < val2) return val1;
	else return val2;
}

function clamp(min, max, val) {
	if (val < min) return min;
	if (val > max) return max;
	return val;
}
