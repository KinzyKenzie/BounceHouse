const pageBody = document.querySelector('body');
const renderScreen = document.getElementById('screen');

const ball = document.getElementById('circle0');
const helperH = document.getElementById('helperH');
const helperV = document.getElementById('helperV');

let ballSize = 40;

const originX = 100;
const originY = 100;

const screenWidth = 720;
const screenHeight = 480;

let play = true;

window.onload = () => {
	
	const refreshRate = 1000 / 30;
	
	startGameStructure();

};

function startGameStructure() {
	
	let positionX = 80, positionY = 80;
	let velocityX = 2, velocityY = 1;

	function step() {
		
		if (play) {
			
			positionX = positionX + velocityX;
			positionY = positionY + velocityY;
			
			if (positionX > screenWidth || positionX < 0) {
				velocityX = velocityX * (-1);
			}
			
			if (positionY > screenHeight) {
				velocityY = velocityY * (-1);
			}
			else velocityY++;
			
			ball.style.left = (originX + clamp(0, screenWidth, positionX) - (ballSize / 2)) + 'px';
			ball.style.top = (originY + min(positionY, screenHeight) - (ballSize / 2)) + 'px';
			
			helperH.style.left = originX + (positionX - 0) + 'px';
			helperH.style.top = originY + positionY + 'px';
			
			helperV.style.left = originX + positionX + 'px';
			helperV.style.top = originY + (positionY - 0) + 'px';
			
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
