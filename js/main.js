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
		this.active = true;
		this.gravity = false;
		this.colliding = false;
		this.timeout = -1;
	}
	
	update() {
		
		if( this.active ) {
			
			this.position[0] = this.position[0] + this.velocity[0];
			this.position[1] = this.position[1] + this.velocity[1];
			
		} else if( this.timeout >= 0 ) {
			
			if( this.timeout > TARGET_FPS * 2 && isPointOnScreen( this.position ) ) this.setActive( true );
			else this.timeout += 1;
			
		}
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
	
	setActive( val ) {
		this.active = val;
		this.timeout = ( val ? -1 : 0 );
		this.DOMObject.style.opacity = ( val ? "initial" : 0.2 );
	}
	
	tryActive() {
		if( this.timeout < 0 ) this.setActive( true );
	}
}

class Helper {
	constructor( DOMObjectA, DOMObjectB, reference ) {
		this.helpX = new Entity( DOMObjectA );
		this.helpY = new Entity( DOMObjectB );
		this.helpX.offset = [ 0, 0 ];
		this.helpY.offset = [ 0, 0 ];
		
		DOMObjectA.style.display = 'initial';
		DOMObjectB.style.display = 'initial';
		
		this.trackedTarget = reference;
	}
	
	update() {
		
		this.helpX.move( this.trackedTarget.position[0] - this.helpX.size[0],
			this.trackedTarget.position[1] );
		this.helpY.move( this.trackedTarget.position[0],
			this.trackedTarget.position[1] - this.helpY.size[1] );
		
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
const TARGET_FPS = 60;
const TARGET_SCORE = 10;
const SPEED_LIMIT = 26;

const renderScreen = document.getElementById('screen');
const scoreReadout = document.getElementById('score');
const textField = document.getElementById('textfield');
const checkpoint = document.getElementById('checkpoint');
// const block = document.getElementById('block0');
const ball = document.getElementById('circle0');
const cursor = document.getElementById('circle1');

const helperH = [
	document.getElementById('helperH0'),
	document.getElementById('helperH1'),
	document.getElementById('helperH2')
];
const helperV = [
	document.getElementById('helperV0'),
	document.getElementById('helperV1'),
	document.getElementById('helperV2')
];

const originX = getStyleValue(renderScreen, 'left');
const originY = getStyleValue(renderScreen, 'top');
const screenWidth = getStyleValue(renderScreen, 'width');
const screenHeight = getStyleValue(renderScreen, 'height');

let play = true;
let scoreCount = 0;

let physicsObjects;
let helpers;
let timestamps = [ '', '' ];

// The main function
// This is where the fun happens
window.onload = () => {
	
	// Time to wait until the next frame is processed. Result is 60 frames per second.
	const refreshRate = 1000 / TARGET_FPS;
	
	init();
	
	setInterval(function () {
		
		if( play ) {
			
			// Update: Move objects by active velocity
			for( let i = 0; i < physicsObjects.length; i++ ) {
				
				let entity = physicsObjects[i];
				
				entity.update();
				
				if( entity.gravity && resolveWorldCollision( entity )) {
					entity.colliding = true;
				}
			}
			
			// Late-Update: Check for collisions between Entities, and Entities-to-world.
			for( let i = 0; i < physicsObjects.length; i++ ) {
				
				if( !physicsObjects[i].active ) continue;
				
				for( let j = i + 1; j < physicsObjects.length; j++ ) {
					
					if( !physicsObjects[j].active ) continue;
					
					// Check for collision between the two selected objects.
					if( physicsObjects[i].type == 'ball' &&
						physicsObjects[j].type == 'plyr' &&
						checkCollision( physicsObjects[i], physicsObjects[j] ) ) {
						
						resolveCollision( physicsObjects[i], physicsObjects[j] );
						
					}
					
					if( physicsObjects[i].type == 'plyr' &&
						physicsObjects[j].type == 'chck' &&
						checkCollision( physicsObjects[i], physicsObjects[j] ) ) {
							
						incrementScore();
						
						if( scoreCount < TARGET_SCORE )
							resetCheckpoint( physicsObjects[j], physicsObjects[i] );
						else
							timeToCelebrate();
						
					}
				}
			}
		}
		
		// Draw objects based on updated parameters
		for( let i = 0; i < physicsObjects.length; i++ ) { physicsObjects[i].draw(); }
		
		if( DEBUG ) {
			for( let i = 0; i < helpers.length; i++ ) { helpers[i].update(); }
			for( let i = 0; i < helpers.length; i++ ) { helpers[i].draw(); }
		}
		
	}, refreshRate);
};

window.onclick = () => {
	
	if( !DEBUG ) return;
	
	play = !play;
	//console.log( "[DBG] Play state set to " + play );
	
	if( play ) renderScreen.style.backgroundColor = '#FFFFFF';
	else  renderScreen.style.backgroundColor = '#D0D0D0';
	
};

function init() {
	
	console.log( "[DBG] Debug Mode is " + ( DEBUG ? "ON" : "OFF" ));
	console.log( "[SYS] Initialising ..." );
	
	physicsObjects = [
		new Entity( cursor, "ball" ),
		new Entity( ball, "plyr" ),
		new Entity( checkpoint, "chck" )/* ,
		new Entity( block, "rect" ) */
	];
	
	physicsObjects[1].gravity = true;
	physicsObjects[1].velocity[0] = 2;
	physicsObjects[2].DOMObject.style.display = 'initial';
	
	resetCheckpoint( physicsObjects[2], physicsObjects[1] );
	
	if( DEBUG ) {
		helpers = [ new Helper( helperH[0], helperV[0], physicsObjects[0] ),
					new Helper( helperH[1], helperV[1], physicsObjects[1] ),
					new Helper( helperH[2], helperV[2], physicsObjects[2] ) ];
	}
	
	renderScreen.onmouseover = function(event) { cursor.style.display = 'initial' };
	renderScreen.onmouseout = function(event) { cursor.style.display = 'none' };
	renderScreen.onmousemove = function(event) {
		physicsObjects[0].move( event.clientX - originX, event.clientY - originY );
	};
	
	// block.style.left = ( getStyleValue( block, 'left' ) + originX ) + 'px';
	// block.style.top = ( getStyleValue( block, 'top' ) + originY ) + 'px';
	
	console.log( "[SYS] Done. Starting game." );
	timestamps[0] = Date.now();
	
}

function resetCheckpoint( cp, player ) {
	
	var iterations = 0;
	
	do {
		
		iterations++;
		
		cp.position[0] = clamp( cp.size[0] * ( 2 - Math.floor( iterations * 0.4 )), screenWidth - cp.size[0], Math.random() * screenWidth );
		cp.position[1] = clamp( cp.size[1] * ( 2 - Math.floor( iterations * 0.4 )), screenHeight - cp.size[1], Math.random() * screenHeight );
		
	} while ( Math.sqrt( Math.pow( Math.abs( cp.position[0] - player.position[0] ), 2 ) +
		 Math.pow( Math.abs( cp.position[1] - player.position[1] ), 2 )) < cp.size[0] * 4 );
	
	
	if( DEBUG ) console.log( "[DBG] Finding a usable checkpoint-location took " + iterations + " attempt(s)." );
	
}

function incrementScore() {
	scoreCount++;
	scoreReadout.innerHTML = scoreCount.toString();
}

function timeToCelebrate() {
	
	timestamps[1] = Date.now();
	console.log( "[SYS] Game finished with time of " + ( timestamps[1] - timestamps[0] ));
	
	for( let i = 0; i < physicsObjects.length; i++ ) {
		if( physicsObjects[i].type == 'plyr' ) continue;
		
		physicsObjects[i].active = false;
		physicsObjects[i].DOMObject.style.display = 'none';
	}
	
	textField.innerHTML = "You win!" +
		"<br/>Time: " + millisToString( timestamps[1] - timestamps[0] );
	
}

function resolveWorldCollision( entity ) {
	
	var val = false;
	
	if( entity.position[0] + (entity.size[0] * 0.5) > screenWidth || entity.position[0] - (entity.size[0] * 0.5) < 0 ) {
		entity.velocity[0] = entity.velocity[0] * (-1);
		val = true;
	}
	
	if( entity.position[1] + (entity.size[0] * 0.5) > screenHeight && entity.velocity[1] > 0.0 ) {
		entity.velocity[1] = entity.velocity[1] * (-1);
		
		limitSpeed( entity );
		// incrementScore();
		
		val = true;
	}
	else {
		entity.velocity[1]++;
	}
	
	return val;
	
}

// Use the pythagorean theorem to calculate the distance between two entities.
// If the distance is shorter than the sum of both entities' radii, there is a collision.
function checkCollision( entityA, entityB ) { // !! Only for use with ball-collisions !!
	
	if( Math.sqrt( Math.pow( Math.abs( entityA.position[0] - entityB.position[0] ), 2 ) +
		Math.pow( Math.abs( entityA.position[1] - entityB.position[1] ), 2 ) ) <
		( entityA.size[0] * 0.5 ) + ( entityB.size[0] * 0.5 ) )
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
	entityB.setActive( false );
	
}

// Limit the speed of the entity to the pre-determined maximum value.
function limitSpeed( entity ) {
	
	var velocityMagnitude = Math.sqrt( Math.pow( Math.abs( entity.velocity[0] ), 2 ) +
		Math.pow( Math.abs( entity.velocity[1] ), 2 ));
	
	if( DEBUG ) console.log( "[DBG] Player speed: " + velocityMagnitude );
	
	if( velocityMagnitude > SPEED_LIMIT ) {
		entity.velocity[0] = entity.velocity[0] * ( SPEED_LIMIT / velocityMagnitude );
		entity.velocity[1] = entity.velocity[1] * ( SPEED_LIMIT / velocityMagnitude );
	}
	
}

// Checks whether a vector-position falls inside the bounds of the game-screen.
function isPointOnScreen( args ) {
	return(
		!( args[0] < 0 ||
		args[0] > screenWidth ||
		args[1] < 0 ||
		args[1] > screenHeight )
	);
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

function millisToString( val ) {
	
	var millis,
		secnds,
		minuts;
	var remainder = val;
	
	millis = remainder - ( Math.floor( remainder / 1000 ) * 1000 );
	remainder -= millis;
	
	secnds = ( remainder - ( Math.floor( remainder / 60000 ) * 60000 )) / 1000;
	remainder -= secnds * 1000;
	
	minuts = ( remainder / 1000 ) / 60;
	remainder -= minuts;
	
	return ( ( minuts.toString().length == 2 ? minuts.toString() : "0" + minuts.toString() ) + ":" +
		( secnds.toString().length == 2 ? secnds.toString() : "0" + secnds.toString() ) + "." +
		millis.toString() );
	
}

function getStyleAttribute( entity, attribute ) {
	return window.getComputedStyle( entity ).getPropertyValue( attribute );
}

function getStyleValue( entity, attribute ) {
	return parseInt( getStyleAttribute( entity, attribute ));
}
