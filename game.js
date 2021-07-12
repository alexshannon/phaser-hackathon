const gameState = {
}

const config = {
  	type: Phaser.AUTO,
  	width: 1800,
	height: 1200,
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
