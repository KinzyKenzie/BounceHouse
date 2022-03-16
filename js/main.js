// ===================
// ===== CLASSES =====
// ===================
class Entity {
	constructor( DOMObject, type ) {
		this.DOMObject = DOMObject;
		this.type = type;
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
	
	move( posX, posY ) {
		this.position[0] = posX;
		this.position[1] = posY;
	}
}

class Helper {
	constructor( DOMObjectA, DOMObjectB, reference ) {
		this.helpX = new Entity( DOMObjectA );
		this.helpY = new Entity( DOMObjectB );
		this.helpX.offset = [ 0, 0 ];
		this.helpY.offset = [ 0, 0 ];
		
		this.trackedTarget = reference;
	}
	
	update() {
		
		this.helpX.move( this.trackedTarget.position[0],
						 this.trackedTarget.position[1] );
		this.helpY.move( this.trackedTarget.position[0],
						 this.trackedTarget.position[1] );
		
	}
	
	draw() {
		this.helpX.draw();
		this.helpY.draw();
	}
}

// ============================
// ===== GLOBAL VARIABLES =====
// ============================

const DEBUG = false; // Draw and handle 'helper' guide lines

//const pageBody = document.querySelector('body');
const renderScreen = document.getElementById('screen');

const block = document.getElementById('block0');
const ball = document.getElementById('circle0');
const cursor = document.getElementById('circle1');
const helperH = [ document.getElementById('helperH0'), document.getElementById('helperH1') ];
const helperV = [ document.getElementById('helperV0'), document.getElementById('helperV1') ];

const originX = getStyleValue(renderScreen, 'left');
const originY = getStyleValue(renderScreen, 'top');
const screenWidth = getStyleValue(renderScreen, 'width');
const screenHeight = getStyleValue(renderScreen, 'height');

let play = true;

let physicsObjects;
let helpers;

// The main function
// This is where the fun happens
window.onload = () => {
	
	const refreshRate = 1000 / 60;
	
	init();
	
	setInterval(function () {
		
		if( play ) {
			
			// First (or 'standard') Update loop
			for( let i = 0; i < physicsObjects.length; i++ ) {
				
				let entity = physicsObjects[i];
				
				entity.update();
				
				if( entity.gravity ) { checkWorldCollision( entity ); }
				
			}
			
			for( let i = 0; i < physicsObjects.length; i++ ) {
				for( let j = i + 1; j < physicsObjects.length; j++ ) {
					
					// Check for collision between the two selected objects.
					if( physicsObjects[i].type == physicsObjects[j].type ) {
						
						if( checkCollision(
								physicsObjects[i].type, physicsObjects[i], physicsObjects[j]
							) ) {
							
							resolveCollision( physicsObjects[i], physicsObjects[j] );
							
						}
					}
				}
			}
			
			if( DEBUG ) {
				for( let i = 0; i < helpers.length; i++ ) { helpers[i].update(); }
			}
		}
		
		for( let i = 0; i < physicsObjects.length; i++ ) { physicsObjects[i].draw(); }
		
		if( DEBUG ) {
			for( let i = 0; i < helpers.length; i++ ) { helpers[i].draw(); }
		}
		
	}, refreshRate);
};

window.onclick = () => {
	
	play = !play;
	//console.log( "[DBG] Play state set to " + play );
	
	if(play) renderScreen.style.backgroundColor = '#FFFFFF';
	else  renderScreen.style.backgroundColor = '#D0D0D0';
	
};

function init() {
	
	console.log( "[DBG] Debug Mode = " + DEBUG.toString().toUpperCase() );
	console.log( "[SYS] Initialising ..." );
	
	physicsObjects = [
		new Entity( cursor, "ball" ),
		new Entity( ball, "ball" ),
		new Entity( block, "rect" )
	];
	
	physicsObjects[1].gravity = true;
	physicsObjects[1].velocity[0] = 2;
	
	if( DEBUG ) {
		
		//console.log( "[DBG] DEBUG MODE: ON" );
		
		helpers = [ new Helper( helperH[0], helperV[0], physicsObjects[0] ),
					new Helper( helperH[1], helperV[1], physicsObjects[1] ) ];
		
		helpers[0].helpX.origin = [ 0, 0 ];
		helpers[0].helpY.origin = [ 0, 0 ];
		
	} else {
		
		//console.log( "[DBG] DEBUG MODE: OFF" );
		
		helperH[0].style.display = 'none';
		helperH[1].style.display = 'none';
		helperV[0].style.display = 'none';
		helperV[1].style.display = 'none';
		
	}
	
	renderScreen.onmouseover = function(event) { cursor.style.display = 'initial' };
	renderScreen.onmouseout = function(event) { cursor.style.display = 'none' };
	
	renderScreen.onmousemove = function(event) {
		physicsObjects[0].position[0] = event.clientX - originX;
		physicsObjects[0].position[1] = event.clientY - originY;
	};
	
	block.style.left = ( getStyleValue( block, 'left' ) + originX ) + 'px';
	block.style.top = ( getStyleValue( block, 'top' ) + originY ) + 'px';
	
	console.log( "[SYS] Done. Starting game." );
	
}

function checkWorldCollision( entity ) {
	
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

function checkCollision( type, entityA, entityB ) {
	
	let distance = Math.floor( Math.sqrt(
		Math.pow( Math.abs( entityA.position[0] - entityB.position[0] ), 2 ) +
		Math.pow( Math.abs( entityA.position[1] - entityB.position[1] ), 2 )
	) );
	
	if( distance < max( entityA.size[0], entityB.size[0] ) {
		
		console.log( "[DBG] Collision Type: " + type + ", distance: " + distance );
		console.log( "[DBG] entityA = [" + entityA.position[0] + ", " + entityA.position[1] + "]" );
		console.log( "[DBG] entityB = [" + entityB.position[0] + ", " + entityB.position[1] + "]" );
		
		//play = false;
		
		return true;
	
	}
	
	return false;
}

function resolveCollision( entityA, entityB ) {
	
	// If both entities are static, exit immediately.
	if( !entityA.gravity && !entityB.gravity ) return;
	
	// If A is static and B is not, switch the variables around.
	if( !entityA.gravity && entityB.gravity ) resolveCollision( entityB, entityA );
	
	
	
}

// ============================
// ===== GLOBAL FUNCTIONS =====
// ============================

function min( val1, val2 ) {
	if( val1 < val2 ) return val1;
	else return val2;
}

function max( val1, val2 ) {
	if( val1 > val2 ) return val1;
	else return val2;
}

function clamp( min, max, val ) {
	if( val < min ) return min;
	if( val > max ) return max;
	return val;
}

function getStyleAttribute( entity, attribute ) {
	return window.getComputedStyle( entity ).getPropertyValue( attribute );
}

function getStyleValue( entity, attribute ) {
	return parseInt( getStyleAttribute( entity, attribute ));
}
