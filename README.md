# 贪食蛇

最近 dan 有在油管上[直播](https://www.youtube.com/c/DanAbramov8),播放量最多的就是手写一个贪食蛇。

本来想学一下大佬写代码的姿势，看了几分钟就没了耐性，心想我为什么不能自己写一个呢。

一步一步跟着敲代码，我实践了一段时间但是收效甚微,因为中间少了自己的思考。

初期可能有些作用，可以学到一些技巧和规范。

但是自己实现一个东西带来的成就感，你不断的 debug 和查文档查资料留下的记忆和习惯，这大概就是这个玩意带给我最大的收获吧。

## 数据结构及变量

```js
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
]

let snake = [...initSnake]

let direction = "right"

let canChangeDirection = true
```

## canvas 绘制页面

```js
//  背景
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

// 蛇
function drawSnake() {
  let step = 100 / (snake.length - 1)
  for (let i = 0; i < snake.length; i++) {
    // 这里做了渐变色的蛇，添加动态色彩。尾部有个最小白色阀值，免得跟背景混为一体
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

// 绘制食物

// 随机生成食物的位置
function generateRandomFood() {
  // 如果没有位置可以生成
  if (snake.length > width * height) {
    return alert("you win")
  }
  const randomX = Math.floor(Math.random() * (width / cellLength))
  const randomY = Math.floor(Math.random() * (height / cellLength))
  // 生成的位置如果跟蛇体积碰撞，则重新生成。
  for (let i = 0; i < snake.length; i++) {
    if (snake[i][0] === randomX && snake[i][1] === randomY) {
      return generateRandomFood()
    }
  }
  foodPosition = [randomX, randomY]
}

// 绘制
function drawFood() {
  ctx.fillStyle = "#ff7875"
  ctx.fillRect(
    foodPosition[0] * cellLength,
    foodPosition[1] * cellLength,
    cellLength,
    cellLength
  )
}
```

## 蛇的移动

```js
// 蛇的移动
// 确定下一次移动的位置，将这个点push到数组末尾（头的位置），
// 将数组第一项shift出来（尾的位置）

// 吃食物的逻辑
// 如果食物的位置跟下一次移动的位置相同，将这个点加入头部，不推出尾部

function snakeMove() {
  let next
  let last = snake[snake.length - 1]
  // 根据方向确定下一个蛇头的位置
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

  // 碰撞重新开始游戏
  if (boundary || selfCollision) {
    return restart()
  }

  snake.push(next)

  // 如果下一个点是食物的位置，不推出头部
  if (next[0] === foodPosition[0] && next[1] === foodPosition[1]) {
    generateRandomFood()
    return
  }
  snake.shift()

  canChangeDirection = true
}
```

## 事件监听

```js
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
```

## requestAnimationFrame 实现动画

```js
// 默认的requestAnimationFrame循环应该是60帧，对于这个游戏来说太快了。
// 所以做了限制，5次loop才渲染（蛇移动一格）一次
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
```

## BUG 解决

游戏规则中，蛇是不能反向移动的。

但是在事件回调中，如果改变方向过快，（5 次 loop 才执行一次重绘），就会出现方向变了，但是蛇的位置没变（比如蛇向右移动，我们先按上再按左），他就和自身碰撞了

解决方案：
我加了一个 canChangeDirection 变量，
当你改变方向之后，必须等待蛇移动了才能再次改变方向

```js
// 事件回调
case "ArrowUp":
  if (direction === "down" |!canChangeDirection) return
  direction = "up"
  canChangeDirection = false
  break
```
