//class Entity {
//	constructor(type, DOMObject) {
//		this.type = type;
//		this.DOMObject = DOMObject;
//	}
//	
//	// Why oh why is this causing an error??
//	//let offset;
//	//let position;
//	//let velocity;
//	
//	update() {}
//	draw() {}
//	
//	move(posX, posY) {
//		DOMObject.style.left = posX;
//		DOMObject.style.top = posY;
//	}
//}
//
//class Ball extends Entity {
//	constructor(DOMObject) {
//		super('Ball', DOMObject);
//	}
//	
//	update() {}
//	draw() {}
//}

const pageBody = document.querySelector('body');
const renderScreen = document.getElementById('screen');

const block = document.getElementById('block0');
const ball = document.getElementById('circle0');
const cursor = document.getElementById('circle1');
const helperH = document.getElementById('helperH0');
const helperV = document.getElementById('helperV0');

const ballSize = parseInt(getStyleAttribute(ball, 'height'));
const ballRadius = ballSize * 0.5;

const originX = parseInt(getStyleAttribute(renderScreen, 'left'));
const originY = parseInt(getStyleAttribute(renderScreen, 'top'));
const screenWidth = parseInt(getStyleAttribute(renderScreen, 'width'));
const screenHeight = parseInt(getStyleAttribute(renderScreen, 'height'));

let positionX = 80, positionY = (screenHeight / 3);
let velocityX = 2, velocityY = 1;

let play = true;

let physicsObjects = {}

//let player = new Entity('player', cursor);

// The main function
// This is where the fun happens
window.onload = () => {
	
	const refreshRate = 1000 / 60;
	
	init();
	
	setInterval(function () {
		
		if (!play) return;
		
		update();
		draw();
		
	}, refreshRate);
	
};

function init() {
	
	renderScreen.onmouseover = function(event){ cursor.style.display = 'initial' };
	renderScreen.onmouseout = function(event){ cursor.style.display = 'none' };
	
	renderScreen.onmousemove = function(event){
		
		cursor.style.left = event.clientX;
		cursor.style.top = event.clientY;
		
	};
	
	block.style.left = (parseInt(getStyleAttribute(block, 'left')) + originX) + 'px';
	block.style.top = (parseInt(getStyleAttribute(block, 'top')) + originY) + 'px';
	
}

function update() {
	
	positionX = positionX + velocityX;
	positionY = positionY + velocityY;
	
	if (positionX + ballRadius > screenWidth || positionX - ballRadius < 0) {
		velocityX = velocityX * (-1);
	}
	
	if (positionY + ballRadius > screenHeight) {
		velocityY = velocityY * (-1);
	}
	else velocityY++;
	
	//checkCollision(block, positionX, positionY, velocityX, velocityY, ballRadius);
	
}

function draw() {
	
	ball.style.left = (originX + clamp(0, screenWidth, positionX) - ballRadius) + 'px';
	ball.style.top = (originY + min(positionY, screenHeight - ballRadius) - ballRadius) + 'px';
	
	helperH.style.left = originX + (positionX - 201) + 'px';
	helperH.style.top = originY + (positionY - 1) + 'px';
	
	helperV.style.left = originX + (positionX - 1) + 'px';
	helperV.style.top = originY + (positionY - 201) + 'px';
	
}

window.onclick = () => {
	
	play = !play;
	console.log("Play state set to " + play);
	
	if (play) renderScreen.style.backgroundColor = '#FFFFFF';
	else  renderScreen.style.backgroundColor = '#D0D0D0';
	
};

function checkCollision(block, positionX, positionY, velocityX, velocityY, ballRadius) {
	
	// This doesn't work, because the ball has a managed, known position, and ...
	// ... the block has its position in screen-space. These differ by 100px on both axis.
	// Also look at that list of passed-on variables LMAO
	
	if (positionX + ballRadius > parseInt(getStyleAttribute(block, 'left')) && 
		positionX - ballRadius < parseInt(getStyleAttribute(block, 'left')) + parseInt(getStyleAttribute(block, 'width')) &&
		positionY + ballRadius > parseInt(getStyleAttribute(block, 'top'))) {
		
		if (positionX < parseInt(getStyleAttribute(block, 'left')) + 1) {
			velocityX = velocityX * (-1);
		}
	}
}

// ===================
// ===== GLOBALS =====
// ===================

function min(val1, val2) {
	if (val1 < val2) return val1;
	else return val2;
}

function clamp(min, max, val) {
	if (val < min) return min;
	if (val > max) return max;
	return val;
}

function getStyleAttribute(entity, attribute) {
	return window.getComputedStyle(entity).getPropertyValue(attribute);
}
