const gameState = {
}

const config = {
  	type: Phaser.AUTO,
  	width: 640,
	height: 360,
	backgroundColor: "b9eaff",
	physics: {
		default: 'arcade',
		arcade: {
			gravity: {y: 1},
			enableBody: true,
			debug: false,
		}
	},
	scene: [StartScene, GameScene]
}

const game = new Phaser.Game(config)
