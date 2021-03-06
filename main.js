const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

const width = 400
const height = 400
const cellLength = 20

let foodPosition

let initSnake = [
  [0, 0],
  [1, 0],
  [2, 0],
  [3, 0],
  [4, 0],
]

let snake = [...initSnake]

let direction = "right"

let canChangeDirection = true

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
      if (direction === "down" || !canChangeDirection) return
      direction = "up"
      canChangeDirection = false
      break
    case "ArrowDown":
      if (direction === "up" || !canChangeDirection) return
      direction = "down"
      canChangeDirection = false
      break
    case "ArrowLeft":
      if (direction === "right" || !canChangeDirection) return
      direction = "left"
      canChangeDirection = false
      break
    case "ArrowRight":
      if (direction === "left" || !canChangeDirection) return
      direction = "right"
      canChangeDirection = false
      break
  }
})

function snakeMove() {
  let next
  let last = snake[snake.length - 1]
  switch (direction) {
    case "up": {
      next = [last[0], last[1] - 1]
      break
    }
    case "down": {
      next = [last[0], last[1] + 1]
      break
    }
    case "left": {
      next = [last[0] - 1, last[1]]
      break
    }
    case "right": {
      next = [last[0] + 1, last[1]]
      break
    }
  }

  // 边缘碰撞
  const boundary =
    next[0] < 0 ||
    next[0] >= width / cellLength ||
    next[1] < 0 ||
    next[1] >= height / cellLength

  // 自身碰撞
  const selfCollision = snake.some(([x, y]) => next[0] === x && next[1] === y)
  if (boundary || selfCollision) {
    debugger
    return restart()
  }

  snake.push(next)
  if (next[0] === foodPosition[0] && next[1] === foodPosition[1]) {
    generateRandomFood()
    return
  }
  snake.shift()

  canChangeDirection = true
}

function drawSnake() {
  let step = 100 / (snake.length - 1)
  for (let i = 0; i < snake.length; i++) {
    const percent = Math.min(100 - step * i, 90)
    ctx.fillStyle = `hsl(0,0%,${percent}%)`

    ctx.fillRect(
      snake[i][0] * cellLength,
      snake[i][1] * cellLength,
      cellLength,
      cellLength
    )
  }
}

function generateRandomFood() {
  if (snake.length > width * height) {
    return alert("you win")
  }
  const randomX = Math.floor(Math.random() * (width / cellLength))
  const randomY = Math.floor(Math.random() * (height / cellLength))
  for (let i = 0; i < snake.length; i++) {
    if (snake[i][0] === randomX && snake[i][1] === randomY) {
      return generateRandomFood()
    }
  }
  foodPosition = [randomX, randomY]
}

function drawFood() {
  ctx.fillStyle = "#ff7875"
  ctx.fillRect(
    foodPosition[0] * cellLength,
    foodPosition[1] * cellLength,
    cellLength,
    cellLength
  )
}

function drawBackground() {
  ctx.strokeStyle = "#bfbfbf"
  for (let i = 0; i <= height / cellLength; i++) {
    ctx.beginPath()
    ctx.moveTo(0, cellLength * i)
    ctx.lineTo(width, cellLength * i)
    ctx.stroke()
  }

  for (let i = 0; i <= width / cellLength; i++) {
    ctx.beginPath()
    ctx.moveTo(cellLength * i, 0)
    ctx.lineTo(cellLength * i, height)
    ctx.stroke()
  }
}

function render() {
  canvas.width = width
  canvas.height = height
  drawBackground()
  drawSnake()
  drawFood()
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

function draw() {
  snakeMove()
  clearCanvas()
  drawBackground()
  drawSnake()
  drawFood()
}

function animate() {
  let count = 0
  function loop() {
    if (++count > 5) {
      draw()
      count = 0
    }
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
}

function restart() {
  snake = [...initSnake]
  direction = "right"
  generateRandomFood()
}

generateRandomFood()
render()
animate()
