const gameState = {
}

const config = {
  	type: Phaser.AUTO,
  	width: 600,
	height: 500,
	backgroundColor: "000000",
	physics: {
		default: 'arcade',
		arcade: {
			gravity: {y: 0},
			enableBody: true,
			debug: false,
		}
	},
	scene: [StartScene, GameScene]
}

const game = new Phaser.Game(config)
