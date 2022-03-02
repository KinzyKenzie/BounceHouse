// ===================
// ===== CLASSES =====
// ===================
class Entity {
	constructor( DOMObject ) {
		this.DOMObject = DOMObject;
		this.size = [
			getStyleValue( DOMObject, 'width' ),
			getStyleValue( DOMObject, 'height' )
		];
		this.offset = [ -(this.size[0] * 0.5), -(this.size[1] * 0.5) ];
		this.position = [
			getStyleValue( DOMObject, 'left' ),
			getStyleValue( DOMObject, 'top' )
		];
		this.velocity = [ 0, 0 ];
		this.gravity = false;
		this.colliding = false;
	}
	
	update() {
		this.position[0] = this.position[0] + this.velocity[0];
		this.position[1] = this.position[1] + this.velocity[1];
	}
	
	draw() {
	
		if( !this.colliding ) {
			this.DOMObject.style.left = ( originX + this.offset[0] + this.position[0] ) + 'px';
			this.DOMObject.style.top = ( originY + this.offset[1] + this.position[1] ) + 'px';
		} else {
			
			this.DOMObject.style.left = ( originX + this.offset[0] +
				clamp( (this.size[0] * 0.5), screenWidth - (this.size[0] * 0.5), this.position[0] )) + 'px';
				
			this.DOMObject.style.top = ( originY + this.offset[1] +
				min( this.position[1], screenHeight - (this.size[1] * 0.5) ) ) + 'px';
			
		}
	}
	
	move(posX, posY) {
		this.position[0] = posX;
		this.position[1] = posY;
	}
}

class Player extends Entity {
	constructor( DOMObject ) {
		super( DOMObject );
	}
	
	update() {}
	
	draw() {
		this.DOMObject.style.left = ( this.position[0] - (this.size[0] * 0.5) ) + 'px';
		this.DOMObject.style.top = ( this.position[1] - (this.size[1] * 0.5) ) + 'px';
	}
}

// ============================
// ===== GLOBAL VARIABLES =====
// ============================

const DEBUG = true; // Draw and handle 'helper' guide lines

const pageBody = document.querySelector('body');
const renderScreen = document.getElementById('screen');

const block = document.getElementById('block0');
const ball = document.getElementById('circle0');
const cursor = document.getElementById('circle1');
const helperH = document.getElementById('helperH0');
const helperV = document.getElementById('helperV0');

const ballSize = getStyleValue(ball, 'height');
const ballRadius = ballSize * 0.5;

const originX = getStyleValue(renderScreen, 'left');
const originY = getStyleValue(renderScreen, 'top');
const screenWidth = getStyleValue(renderScreen, 'width');
const screenHeight = getStyleValue(renderScreen, 'height');

let positionX = 80, positionY = (screenHeight / 3);
let velocityX = 2, velocityY = 1;
let gravity = 1;

let play = true;

let physicsObjects;

//let player = new Entity('player', cursor);

// The main function
// This is where the fun happens
window.onload = () => {
	
	const refreshRate = 1000 / 60;
	
	init();
	
	setInterval(function () {
		
		//if( !play ) return;
		if( play ) {
			
			//update();
			//draw();
			
			// First (or 'standard') Update loop
			for( let i = 0; i < physicsObjects.length; i++ ) {
				
				let entity = physicsObjects[i];
					
				entity.update();
				
				if( entity.gravity ) { checkCollision("world", entity); }
				
			}
			
			for( let i = 0; i < physicsObjects.length; i++ ) {
				for( let j = i + 1; j < physicsObjects.length; j++ ) {
					
					// Check for collision between the two selected objects.
					
				}
			}
		}
		
		for( let i = 0; i < physicsObjects.length; i++ ) { physicsObjects[i].draw(); }
		
	}, refreshRate);
};

window.onclick = () => {
	
	play = !play;
	console.log("Play state set to " + play);
	
	if(play) renderScreen.style.backgroundColor = '#FFFFFF';
	else  renderScreen.style.backgroundColor = '#D0D0D0';
	
};

function init() {
	
	physicsObjects = [ new Player( cursor ), new Entity( ball ), new Entity( block ) ];
	physicsObjects[1].gravity = true;
	physicsObjects[1].velocity[0] = 2;
	
	//TEST
	console.log( physicsObjects[0].position[0] + ", " + physicsObjects[0].position[1] );
	console.log( physicsObjects[1].position[0] + ", " + physicsObjects[1].position[1] );
	console.log( physicsObjects[2].position[0] + ", " + physicsObjects[2].position[1] );
	
	renderScreen.onmouseover = function(event) { cursor.style.display = 'initial' };
	renderScreen.onmouseout = function(event) { cursor.style.display = 'none' };
	
	renderScreen.onmousemove = function(event) {
		
		//cursor.style.left = event.clientX;
		//cursor.style.top = event.clientY;
		physicsObjects[0].position[0] = event.clientX;
		physicsObjects[0].position[1] = event.clientY;
		
	};
	
	block.style.left = ( getStyleValue( block, 'left' ) + originX ) + 'px';
	block.style.top = ( getStyleValue( block, 'top' ) + originY ) + 'px';
	
}

// Deprecated. Saving for future reference.
function draw() {
	
	ball.style.left = (originX + clamp(0, screenWidth, positionX) - ballRadius) + 'px';
	ball.style.top = (originY + min(positionY, screenHeight - ballRadius) - ballRadius) + 'px';
	
	helperH.style.left = originX + (positionX - 201) + 'px';
	helperH.style.top = originY + (positionY - 1) + 'px';
	
	helperV.style.left = originX + (positionX - 1) + 'px';
	helperV.style.top = originY + (positionY - 201) + 'px';
	
}

function checkCollision(type, entity) {
	
	if( type == "world" ) {
		
		if( entity.position[0] + (entity.size[0] * 0.5) > screenWidth || entity.position[0] - (entity.size[0] * 0.5) < 0 ) {
			entity.velocity[0] = entity.velocity[0] * (-1);
			entity.colliding = true;
		}
		
		if( entity.position[1] + (entity.size[0] * 0.5) > screenHeight ) {
			entity.velocity[1] = entity.velocity[1] * (-1);
			entity.colliding = true;
		}
		else {
			entity.velocity[1]++;
			entity.colliding = false;
		}
		
	}
}

// ============================
// ===== GLOBAL FUNCTIONS =====
// ============================

function min(val1, val2) {
	if(val1 < val2) return val1;
	else return val2;
}

function clamp(min, max, val) {
	if(val < min) return min;
	if(val > max) return max;
	return val;
}

function getStyleAttribute(entity, attribute) {
	return window.getComputedStyle(entity).getPropertyValue(attribute);
}

function getStyleValue(entity, attribute) {
	return parseInt(getStyleAttribute(entity, attribute));
}
