/* UNFINISHED */

/* MODE DEFINITION */
angleMode = "degrees";



/* PARAMETERS */
// adjustable parameters for difficulty
var START_SEGMENTS = 3; // increase to skip to higher difficulty. Must be at least 1.
var SEGMENT_SIZE = 20;
var MOVE_SPEED = 3;
var ROTATION_SPEED = 3; // rotation speed (control response)
var SNAKE_COLOR = color(8, 173, 2);
var EYE_COLOR = color(0, 0, 0); // todo





/*************/
/** UTILITY **/
/*************/

var dirFrom2Pts = function(x1,y1,x2,y2) {
    var dx = x2-x1;
    var dy = y2-y1;
    return atan2(dy,dx);
};



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
    noStroke();
	fill(SNAKE_COLOR);
	ellipse(this.x, this.y, SEGMENT_SIZE, SEGMENT_SIZE);
};



/* SNAKE */

var Snake = function() {
	this.segments = [];
	// initialize segments (according to START_SEGMENTS)
	// start with tail near the middle of the lower edge of the screen, and snake extending above
	var headStartX = width/2;
	var headStartY = height - 2*SEGMENT_SIZE;
	for(var i = 0; i < START_SEGMENTS; i++) {
		var seg = new Segment(headStartX, headStartY + (i*SEGMENT_SIZE), 270); // all start directed upwards
		this.segments.push(seg);
	}
	this.score = 0;
};

Snake.prototype.turn = function(angleDelta) {
    // angleDelta in degrees clockwise
    this.segments[0].dir = (this.segments[0].dir+angleDelta) % 360;
};

Snake.prototype.move = function() {
    for(var i = this.segments.length-1; i >= 1; i--) {
        // The whole snake doesn't move in the same direction, it moves towards where the segment in front was before
		var segCurr = this.segments[i];
		var segNext = this.segments[i-1];
		this.segments[i].dir = dirFrom2Pts(segCurr.x,segCurr.y,segNext.x,segNext.y);

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
	if(keyIsPressed) {
		if(keyCode === RIGHT) {
			// change direction of front segment
			playerSnake.turn(ROTATION_SPEED);
			ellipse(390,10,100,100); // DBG
		}
		else if(keyCode === LEFT) {
			playerSnake.turn(-ROTATION_SPEED);
			ellipse(10,10,100,100); // DBG
		}
	}
	playerSnake.move();
	playerSnake.draw();
};