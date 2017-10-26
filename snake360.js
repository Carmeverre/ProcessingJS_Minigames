/* BASICALLY FINISHED, but unpolished */

/* MODE DEFINITION */
angleMode = "degrees";



/* PARAMETERS */
// adjustable parameters for difficulty
var WRAPAROUND = true;
var START_SEGMENTS = 3; // increase to skip to higher difficulty. Must be at least 1.
var SEGMENT_SIZE = 20;
var FRUIT_SIZE = SEGMENT_SIZE;
var MOVE_SPEED = 3;
var ROTATION_SPEED = 5; // rotation speed (control response)
var SNAKE_COLOR = color(8, 173, 2);
var EYE_COLOR = color(0, 0, 0); // todo
// TODO: wrap screen and edge collision modes. Current implementation: edge collision





/*************/
/** UTILITY **/
/*************/

var dirFrom2Pts = function(x1,y1,x2,y2) {
    var dx = x2-x1;
    var dy = y2-y1;
    return atan2(dy,dx);
};

var wrapMod = function(n,mod){
    return (n%mod + mod) % mod;
};

var wrappedX = function(x){
    return wrapMod(x, width);
};

var wrappedY = function(y){
    return wrapMod(y, height);
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

Segment.prototype.move = function(distToNextSegment) {
    var moveDist = distToNextSegment ? min(distToNextSegment - SEGMENT_SIZE, MOVE_SPEED) : MOVE_SPEED; // twice the radius reduces it to the distance between segment edges
    this.x += moveDist * cos(this.dir);
    this.y += moveDist * sin(this.dir);
	ellipse(this.x, this.y, SEGMENT_SIZE, SEGMENT_SIZE);
};

Segment.prototype.draw = function() {
    noStroke();
	fill(SNAKE_COLOR);
	if(WRAPAROUND){ // note: adjusting it here instead of in move so that angles between segments don't get messed up.
	    ellipse(wrappedX(this.x), wrappedY(this.y), SEGMENT_SIZE, SEGMENT_SIZE);
	}
	else{
	    ellipse(this.x, this.y, SEGMENT_SIZE, SEGMENT_SIZE);
	}
};

// obj may be segment or anything else with x,y,r properties
Segment.prototype.detectCollision = function(obj){
    var dx = this.x - obj.x;
    var dy = this.y - obj.y;
    if(WRAPAROUND){
        dx = wrappedX(this.x) - wrappedX(obj.x);
        dy = wrappedY(this.y) - wrappedY(obj.y);
    }
    if (sqrt(dx*dx+dy*dy) < this.r + obj.r - 2) { // margin of error
        return true;
    }
    return false;
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
	this.segments[0].move();
	for(var i = 1; i < this.segments.length; i++) {
	    var seg1 = this.segments[i];
	    var seg2 = this.segments[i-1];
	    var distToPrev = dist(seg1.x,seg1.y,seg2.x,seg2.y);
		this.segments[i].move(distToPrev);
	}
};

Snake.prototype.draw = function() {
	for(var i = 0; i < this.segments.length; i++) {
		this.segments[i].draw();
	}
	// TODO: draw eyes on the head (first) segment to indicate which direction the snake is going
};

Snake.prototype.detectSelfCollision = function() {
    var head = this.segments[0];
    for(var i = 1; i < this.segments.length; i++) {
        if(head.detectCollision(this.segments[i])) {
            return true;
        }
    }
    return false;
};

var fruits = [];
Snake.prototype.detectFruitCollision = function() {
    var head = this.segments[0];
    for(var i = 0; i < fruits.length; i++) {
        if(head.detectCollision(fruits[i])) {
            return i;
        }
    }
    return -1;
};

Snake.prototype.detectEdgeCollision = function() {
    if(WRAPAROUND)
    {
        return false;
    }
    var head = this.segments[0];
    var r = head.r;
    if(head.x <= 0 + r || head.x >= width - r ||
       head.y <= 0 + r || head.y >= height - r) {
           return true;
    }
    return false;
};

Snake.prototype.addSegment = function() {
    var tail = this.segments[this.segments.length-1];
    var newX = tail.x; // todo: location for new segment dependent on old so it doesn't unfold weirdly?
    var newY = tail.y;
    var seg = new Segment(newX, newY, tail.dir);
	this.segments.push(seg);
};





/***************/
/** INSTANCES **/
/***************/

var playerSnake = new Snake();
// todo-later: scenes for main screen etc.?



/******************/
/** DRAW UTILITY **/
/******************/

var drawGameOver = function() {
    fill(255, 0, 0);
    textFont(createFont("monospace Bold", 12), 36); // Set Custom Font
    text("GAME OVER!",110,190);
};

var drawScore = function() {
    fill(0, 0, 0);
    textSize(10);
    text("SCORE: " + playerSnake.score,10,20);
};

var fruitColors = [
    color(255, 234, 0),
    color(255, 0, 72),
    color(128, 247, 49),
    color(142, 40, 250)
];
var generateFruit = function() {
    var fruitColor = fruitColors[floor(random(fruitColors.length))];
    fruits.push({
        color : fruitColor,
        x : random(10, width-10),
        y : random(10, height-10),
        r : FRUIT_SIZE/2
    });
};
var drawFruit = function(fruit) {
    fill(fruit.color);
    ellipse(fruit.x, fruit.y, 2*fruit.r, 2*fruit.r);
};
var drawFruits = function() {
    for(var i=0; i<fruits.length; i++){
        drawFruit(fruits[i]);
    }
};

var drawResetButton = function(fruit) {
    stroke(0, 0, 0);
    fill(219, 255, 36);
    rect(width-55,0,53,20);
    fill(0, 0, 0);
    textSize(14);
    text("reset?", width-50,15);
};



/********************/
/** EVENT HANDLERS **/
/********************/

var gameOver = false;
generateFruit();

draw = function() {
    if(!gameOver){ // screen will stay as it is when game ends, except for "game over" message
        background(255, 255, 255);
	    if(keyIsPressed) {
		    if(keyCode === RIGHT) {
			    // change direction of front segment
			    playerSnake.turn(ROTATION_SPEED);
			    //ellipse(390,10,100,100); // DBG
		    }
		    else if(keyCode === LEFT) {
			    playerSnake.turn(-ROTATION_SPEED);
			    //ellipse(10,10,100,100); // DBG
		    }
	    }
	    playerSnake.move();
	    playerSnake.draw();
	    
	    drawFruits();
	    var collided = playerSnake.detectFruitCollision();
	    if(collided >= 0) {
	        playerSnake.score++;
	        fruits.splice(collided,1);
	        generateFruit(); // draw immediately on eating previous fruit
	        drawFruits(); // redraw because removed fruit
	        playerSnake.addSegment();
	        playerSnake.draw(); // redraw because added segment
	    }
	    drawScore();
	    
	    if(playerSnake.detectSelfCollision() || playerSnake.detectEdgeCollision()){
	        gameOver = true;
	        drawGameOver();
	        drawResetButton();
	    }
    }
};

mouseClicked = function() {
    if(mouseX > width-55 && mouseY < 20) {
        playerSnake = new Snake();
        fruits = [];
        generateFruit();
        gameOver = false;
    }
};