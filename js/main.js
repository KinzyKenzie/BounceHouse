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

const DEBUG = false; // Draw and handle 'helper' guide lines, write additional information to the console.

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
	
	const refreshRate = 1000 / 60; // Time to wait until the next frame is processed. Result is 60 frames per second.
	
	init();
	
	setInterval(function () {
		
		if( play ) {
			
			// Update: Move objects by active velocity
			for( let i = 0; i < physicsObjects.length; i++ ) {
				
				let entity = physicsObjects[i];
				
				entity.update();
				
				if( entity.gravity && resolveWorldCollision( entity )) {
					
					entity.colliding = true;
					
					console.log( "Entity height: " + ( screenHeight - entity.position[1] ) + "\nEntity velocity: " +
						Math.sqrt( Math.pow( Math.abs( entity.velocity[0] ), 2 ) +
							Math.pow( Math.abs( entity.velocity[1] ), 2 ))
					);
					
				}
			}
			
			// Late-Update: Check for collisions between Entities, and Entities-to-world.
			for( let i = 0; i < physicsObjects.length; i++ ) {
				for( let j = i + 1; j < physicsObjects.length; j++ ) {
					
					// Check for collision between the two selected objects.
					if( physicsObjects[i].type == physicsObjects[j].type &&
						checkCollision( physicsObjects[i], physicsObjects[j] ) ) {
						resolveCollision( physicsObjects[i], physicsObjects[j] );
					}
					
				}
			}
			
			// If necessary, move helper-objects to match position with their tracked entities.
			if( DEBUG ) {
				for( let i = 0; i < helpers.length; i++ ) { helpers[i].update(); }
			}
		}
		
		// Draw objects based on updated parameters
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
	
	console.log( "[DBG] Debug Mode is " + ((DEBUG) ? "ON" : "OFF" ) );
	console.log( "[SYS] Initialising ..." );
	
	physicsObjects = [
		new Entity( cursor, "ball" ),
		new Entity( ball, "ball" ),
		new Entity( block, "rect" )
	];
	
	physicsObjects[1].gravity = true;
	physicsObjects[1].velocity[0] = 2;
	
	if( DEBUG ) {
		
		helpers = [ new Helper( helperH[0], helperV[0], physicsObjects[0] ),
					new Helper( helperH[1], helperV[1], physicsObjects[1] ) ];
		
		helpers[0].helpX.origin = [ 0, 0 ];
		helpers[0].helpY.origin = [ 0, 0 ];
		
	} else {
		
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

function resolveWorldCollision( entity ) {
	
	var val = false;
	
	if( entity.position[0] + (entity.size[0] * 0.5) > screenWidth || entity.position[0] - (entity.size[0] * 0.5) < 0 ) {
		entity.velocity[0] = entity.velocity[0] * (-1);
		// entity.colliding = true;
		val = true;
	}
	
	if( entity.position[1] + (entity.size[0] * 0.5) > screenHeight ) {
		entity.velocity[1] = entity.velocity[1] * (-1);
		// entity.colliding = true;
		val = true;
	}
	else {
		entity.velocity[1]++;
		// entity.colliding = false;
	}
	
	return val;
	
}

function checkCollision( entityA, entityB ) {
	
	// Use the pythagorean theorem to calculate the distance between the two entities.
	// If the distance is shorter than the sum of both entities' radii, there is a collision.
	
	if( Math.sqrt(
			Math.pow( Math.abs( entityA.position[0] - entityB.position[0] ), 2 ) +
			Math.pow( Math.abs( entityA.position[1] - entityB.position[1] ), 2 )
		) < max( entityA.size[0], entityB.size[0] ))
		return true;
	
	return false;
}

function resolveCollision( entityA, entityB ) {
	
	// If both entities are static exit immediately.
	if( !entityA.gravity && !entityB.gravity ) return;
	
	// If A is static and B is not switch the variables around.
	if( !entityA.gravity && entityB.gravity ) {
		resolveCollision( entityB, entityA );
		return;
	}
	
	// Assume A is affected by gravity, B is static.
	
	var collisionVector = [
		entityA.position[0] - entityB.position[0],
		entityA.position[1] - entityB.position[1]
	];
	var collisionMagnitude = Math.sqrt(
		Math.pow( Math.abs( collisionVector[0] ), 2 ) + Math.pow( Math.abs( collisionVector[1] ), 2 )
	);
	
	var entityMagnitude = Math.sqrt(
		Math.pow( Math.abs( entityA.velocity[0] ), 2 ) + Math.pow( Math.abs( entityA.velocity[1] ), 2 )
	);
	
	entityA.velocity = [
		entityMagnitude * ( collisionVector[0] / collisionMagnitude ),
		entityMagnitude * ( collisionVector[1] / collisionMagnitude )
	];
	
	// play = false;
	
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
