const game = {
  wins: [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]
  ],

  board: Array(9),
  score: [0, 0],
  bounds: {},
  player: null,
  winner: null,

  init: () => {
    game.board.fill(null)
    game.player = 0
    game.winner = null
  },

  draw: () => {
    game.ctx.drawImage(game.image, game.bounds.x, game.bounds.y, game.bounds.w, game.bounds.h)

    const line = (x, y, w, h, color) => {
      game.ctx.beginPath()
      game.ctx.moveTo(x, y)
      game.ctx.lineTo(x + w, y + h)
      game.ctx.closePath()

      game.ctx.strokeStyle = color
      game.ctx.stroke()
    }

    const unit = (x, y, p) => {
      switch (p) {
        case 0:
          line(x - 0.3 * game.cell, y - 0.3 * game.cell, game.cell * 0.6, game.cell * 0.6, "blue")
          line(x - 0.3 * game.cell, y + 0.3 * game.cell, game.cell * 0.6, game.cell * -0.6, "blue")
          break

        case 1:
          game.ctx.beginPath()
          game.ctx.arc(x, y, 0.3 * game.cell, 0, 2 * Math.PI)
          game.ctx.closePath()

          game.ctx.strokeStyle = "red"
          game.ctx.stroke()
          break
      }
    }

    const score = (p, y) => {
      unit(game.bounds.x + 0.7 * game.cell, game.bounds.y + game.bounds.h - y * game.cell, p)

      game.ctx.font = Math.floor(game.cell * 0.9) + "px Sans"
      game.ctx.fillStyle = game.ctx.strokeStyle

      game.ctx.fillText(
        " " + game.score[p],
        game.bounds.x + 1.1 * game.cell,
        game.bounds.y + game.bounds.h - (y - 0.32) * game.cell)
    }

    line(game.x, game.y + game.cell * 1, game.cell * 3, 0, "black")
    line(game.x, game.y + game.cell * 2, game.cell * 3, 0, "black")
    line(game.x + game.cell * 1, game.y, 0, game.cell * 3, "black")
    line(game.x + game.cell * 2, game.y, 0, game.cell * 3, "black")

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const x = game.x + (i + 0.5) * game.cell
        const y = game.y + (j + 0.5) * game.cell
        unit(x, y, game.board[j * 3 + i])
      }
    }

    score(0, 1.9)
    score(1, 0.7)

    if (game.winner !== null) {
      game.ctx.fillStyle = "grey"
      game.ctx.fillRect(game.bounds.x, game.bounds.y, game.bounds.w, game.cell)

      if (game.winner === false) {
        game.ctx.fillStyle = "black"
        game.ctx.fillText("Tie", game.bounds.x + 2.7 * game.cell, game.bounds.y + 0.8 * game.cell)
        return
      }

      unit(game.bounds.x + 2.2 * game.cell, game.bounds.y + 0.5 * game.cell, game.board[game.winner[0]])
      game.ctx.fillStyle = game.ctx.strokeStyle
      game.ctx.fillText("Won", game.bounds.x + 2.8 * game.cell, game.bounds.y + 0.8 * game.cell)

      const x = Math.floor(game.winner[0] % 3)
      const y = Math.floor(game.winner[0] / 3)

      const w = Math.floor(game.winner[2] % 3) - x
      const h = Math.floor(game.winner[2] / 3) - y

      if (h === 0) {
        line(game.x + x * game.cell, game.y + (y + 0.5) * game.cell, (w + 1) * game.cell, h * game.cell, "black")
      } else if (w === 0) {
        line(game.x + (x + 0.5) * game.cell, game.y + y * game.cell, w * game.cell, (h + 1) * game.cell, "black")
      } else if (w > 0) {
        line(game.x, game.y, 3 * game.cell, 3 * game.cell, "black")
      } else {
        line(game.x, game.y + 3 * game.cell, 3 * game.cell, -3 * game.cell, "black")
      }
    }
  },

  check: () => {
    if (game.player === null) {
      return
    }

    for (const combo of game.wins) {
      const a = game.board[combo[0]]
      if (a !== null && a == game.board[combo[1]] && a == game.board[combo[2]]) {
        game.score[a]++
        game.player = null
        game.winner = combo
        return
      }
    }

    if (game.board.indexOf(null) === -1) {
      game.player = null
      game.winner = false
    }
  },

  click: (x, y) => {
    if (game.player === null) {
      x -= game.bounds.x
      y -= game.bounds.y

      if (x <= 0 || x >= game.bounds.w || y <= 0 || y >= game.bounds.h) {
        return
      }

      game.init()
      game.draw()
      return
    }

    x = (x - game.x) / game.cell
    y = (y - game.y) / game.cell
    if (x <= 0 || x >= 3 || y <= 0 || y >= 3) {
      return
    }

    const p = Math.floor(y) * 3 + Math.floor(x)
    if (game.board[p] !== null) {
      return
    }

    game.board[p] = game.player
    game.player = 1 - game.player

    game.check()
    game.draw()
  },

  resize: () => {
    game.app.width = window.innerWidth
    game.app.height = window.innerHeight

    const scale = Math.min(
      game.app.width / game.image.width,
      game.app.height / game.image.height)

    game.bounds.w = game.image.width * scale
    game.bounds.h = game.image.height * scale
    game.bounds.x = (game.app.width - game.bounds.w) / 2
    game.bounds.y = (game.app.height - game.bounds.h) / 2

    game.x = game.bounds.x + game.bounds.w * 0.25
    game.y = game.bounds.y + game.bounds.w * 0.35
    game.cell = game.bounds.w * 0.15

    game.ctx.lineWidth = Math.floor(5 * scale)
    game.draw()
  }
}

window.onload = () => {
  game.app = document.getElementById("app")
  game.ctx = game.app.getContext("2d")

  game.image = new Image()
  game.image.onload = () => {
    game.app.onclick = (e) => game.click(e.offsetX, e.offsetY)
    game.init()

    window.onresize = game.resize
    window.onresize()
  }
  game.image.src = "image.png"
}
