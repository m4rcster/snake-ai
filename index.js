const Snake = require('@marcster/snake-js');

class SmartSnake extends Snake {

  loop() {
    super.loop();

    this.dope();

    let inputs = this.logic();
    inputs = inputs.map(i => (i) ? 1 : 0)

    turn(inputs, this.snake.dx, this.snake.dy);
  }

  gameOver() {
    super.gameOver();
    dead();
  }

  reset() {
    super.reset();
    this.dopamine = 0;
  }

  draw() {
    super.draw();
    let text = '🏆: ' + this.score + ' 🧠: ' + this.dopamine;
    let x = this.ui.center.x - text.length / 2;
    let y = this.box.top - 2;
    this.ui.cursor.goto(x, y).write(text);
  }

  spawn() {
    super.spawn();
    this.dopamine += 20;
  }

  logic() {
    let snake = this.snake;
    let apple = this.apple;

    let left = {
      dx: snake.dy * this.grid.x,
      dy: -1 * snake.dx / this.grid.x
    }

    let right = {
      dx: -1 * snake.dy * this.grid.x,
      dy: snake.dx / this.grid.x
    }

    // clearAhead
    let clearAhead = true;
    // define cell ahead
    let cellAhead = {
      x: snake.x + snake.dx,
      y: snake.y + snake.dy
    }
    // check if cell is out of bounds
    clearAhead = this.box.contains(cellAhead.x, cellAhead.y);

    // clearLeft
    let clearLeft = true;
    // define cell left
    let cellLeft = {
      x: snake.x + left.dx,
      y: snake.y + left.dy
    }
    // check if cell is out of bounds
    clearLeft = this.box.contains(cellLeft.x, cellLeft.y);

    // clearRight
    let clearRight = true;
    // define cell right
    let cellRight = {
      x: snake.x + right.dx,
      y: snake.y + right.dy
    }
    // check if cell is out of bounds
    clearRight = this.box.contains(cellRight.x, cellRight.y);

    // check if cell is snake body
    for(let i = 0; i < snake.cells.length; i++) {
      let cell = snake.cells[i];
      if(cellAhead.x === cell.x && cellAhead.y === cell.y) {
        clearAhead = false;
      }
      if(cellLeft.x === cell.x && cellLeft.y === cell.y) {
        clearLeft = false;
      }
      if(cellRight.x === cell.x && cellRight.y === cell.y) {
        clearRight = false;
      }
    }

    /*
    this.debug('h:' + snake.x + ',' + snake.y +
      '; l:' + cellLeft.x + ',' + cellLeft.y + '>' + clearLeft +
      '; a:' + cellAhead.x + ',' + cellAhead.y + '>' + clearAhead +
      '; r:' + cellRight.x + ',' + cellRight.y + '>' + clearRight)
    */

    // check if apple is aligned with snake
    let foodAhead, foodLeft, foodRight;
    foodAhead = foodLeft = foodRight = false;

    if(snake.dx > 0) {
      // foodAhead
      if(apple.x > snake.x && apple.y === snake.y) foodAhead = true;
      if(apple.y < snake.y && apple.x === snake.x) foodLeft = true;
      if(apple.y > snake.y && apple.x === snake.x) foodRight = true;
    }
    if(snake.dx < 0) {
      if(apple.x < snake.x && apple.y === snake.y) foodAhead = true;
      if(apple.y > snake.y && apple.x === snake.x) foodLeft = true;
      if(apple.y < snake.y && apple.x === snake.x) foodRight = true;
    }
    if(snake.dy > 0) {
      if(apple.y > snake.y && apple.x === snake.x) foodAhead = true;
      if(apple.x > snake.x && apple.y === snake.y) foodLeft = true;
      if(apple.x < snake.x && apple.y === snake.y) foodRight = true;
    }
    if(snake.dy < 0) {
      if(apple.y < snake.y && apple.x === snake.x) foodAhead = true;
      if(apple.x < snake.x && apple.y === snake.y) foodLeft = true;
      if(apple.x > snake.x && apple.y === snake.y) foodRight = true;
    }

    /*
        this.debug('fa:' + foodAhead +
          '; fl:' + foodLeft +
          '; fr:' + foodRight);
    */

    return [clearLeft, clearAhead, clearRight, foodLeft, foodAhead, foodRight];
  }

  dope() {
    // kill stupid snake
    if(this.dopamine < -30) return this.gameOver();

    let apple = this.apple;
    let to = this.snake.cells[0];
    let from = this.snake.cells[1];

    if(!to || !from) return;

    // distance between two points
    var a = to.x - apple.x;
    var b = to.y - apple.y;
    var c = Math.sqrt(a * a + b * b);
    var d = from.x - apple.x;
    var e = from.y - apple.y;
    var f = Math.sqrt(d * d + e * e);

    if(f > c) {
      this.dopamine += 2;
    } else {
      this.dopamine -= 3;
    }

    return (f)
  }
}


let Darwin = require('./src/darwin');
const snakesPerGen = 10;
const gameSpeed = 50;

const json = require('./data/save-0812-50.json');

let darwin = new Darwin(snakesPerGen);
//darwin.fromJson(json)

let game = new SmartSnake(15, 15, () => {}, gameSpeed);

let snake = darwin.individual;
game.handleKey('space');

function turn(inputs, dx, dy) {
  let output = snake.feedForward(inputs);
  let winner = output.indexOf(Math.max(...output));
  let key = '';

  if(dx > 0) {
    if(winner === 1) {
      key = 'up';
    }
    if(winner === 2) {
      key = 'down';
    }
  }
  if(dx < 0) {
    if(winner === 1) {
      key = 'down';
    }
    if(winner === 2) {
      key = 'up';
    }
  }
  if(dy > 0) {
    if(winner === 1) {
      key = 'right';
    }
    if(winner === 2) {
      key = 'left';
    }
  }
  if(dy < 0) {
    if(winner === 1) {
      key = 'left';
    }
    if(winner === 2) {
      key = 'right';
    }
  }

  game.debug('>' + key)

  game.handleKey(key);
}

function dead() {
  //darwin.log('Snake ' + snake.id + ' is dead, score: ' + game.score + ' dopamine: ' + game.dopamine);
  darwin.individual.score = game.score;
  darwin.individual.fitness = game.dopamine;

  // load next snake in darwin
  darwin.next();
  snake = darwin.individual;

  // restart game with new snake
  game.handleKey('space');
  game.handleKey('space');
}