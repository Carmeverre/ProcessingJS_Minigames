/* UNFINISHED */

/* MODE DEFINITION */
angleMode = "degrees";


/* PARAMETERS */
// adjustable parameters for difficulty
var START_SEGMENTS = 3; // increase to skip to higher difficulty. Must be at least 1.
var SEGMENT_SIZE = 20;
var MOVE_SPEED = 5;
var ROTATION_SPEED = 1; // rotation speed (control response)
// todo: snake color





/*************/
/** CLASSES **/
/*************/

/* SEGMENT */

var Segment = function(x,y,dir) {
	// center:
	this.x = x;
	this.y = y;
	
	// movement:
	this.dir = dir; // direction in degrees from right side
	
	// drawing:
	this.r = SEGMENT_SIZE/2;
};

Segment.prototype.move = function() {
    this.x += MOVE_SPEED * cos(this.dir);
    this.y += MOVE_SPEED * sin(this.dir);
	ellipse(this.x, this.y, SEGMENT_SIZE, SEGMENT_SIZE);
};

Segment.prototype.draw = function() {
	fill(0,0,0/*TODO*/);
	ellipse(this.x, this.y, SEGMENT_SIZE, SEGMENT_SIZE);
};



/* SNAKE */

var Snake = function() {
	this.segments = [];
	// initialize segments (according to START_SEGMENTS)
	// start with tail near the middle of the lower edge of the screen, and snake extending above
	var tailStartX = width/2;
	var tailStartY = height - 2*SEGMENT_SIZE;
	for(var i = 0; i < START_SEGMENTS; i++) {
		var seg = new Segment(tailStartX, tailStartY + (START_SEGMENTS*SEGMENT_SIZE), 270);
		this.segments.push(seg);
	}
	
	//this.direction = 90; // TODO: degrees from what? Intention is to point up.
	// TODO: have the direction tied to segment instead?
	// The whole snake doesn't move in the same direction, it moves towards where the segment in front was before
	this.score = 0;
};

Snake.prototype.turn = function(angleDelta) {
    // angleDelta in degrees clockwise
    this.segments[0].dir = (this.segments[0].dir+angleDelta) % 360;
};

Snake.prototype.move = function() {
    for(var i = this.segments.length-1; i >= 1; i--) {
		this.segments[i].dir = this.segments[i-1].dir;
	}
	for(var i = 0; i < this.segments.length; i++) {
		this.segments[i].move();
	}
};

Snake.prototype.draw = function() {
	for(var i = 0; i < this.segments.length; i++) {
		this.segments[i].draw();
	}
	// TODO: draw eyes on the head (first) segment to indicate which direction the snake is going
};





/***************/
/** INSTANCES **/
/***************/

var playerSnake = new Snake();
// todo-later: scenes for main screen etc.?





/********************/
/** EVENT HANDLERS **/
/********************/

draw = function() {
    background(255, 255, 255);
	// +=MOVE_SPEED; // delta, should be broken into x and y, or something should be done wih rotate
	// would rotate work for each segment separately? Will it just save me explicit trig calculations?
	// meh, implement with trig, easier to debug...
	if(keyIsPressed) {
		if(keyPressed === RIGHT) {
			// change direction of front segment
			playerSnake.turn(-ROTATION_SPEED);
		}
		else if(keyPressed === LEFT) {
			playerSnake.turn(ROTATION_SPEED);
		}
	}
	playerSnake.move();
	playerSnake.draw();
};