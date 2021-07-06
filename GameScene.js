class GameScene extends Phaser.Scene {
	constructor(){
		super( {key: 'GameScene'} )
	}
    preload(){
        this.load.image('codey', 'https://content.codecademy.com/courses/learn-phaser/physics/codey.png')
        console.log('player loaded')
    }
    create(){
        gameState.player = this.physics.add.sprite(225, 450, 'codey');
        console.log(gameState.player)
        gameState.player.setCollideWorldBounds(true);
        gameState.cursors = this.input.keyboard.createCursorKeys();
    }
    update(){
        if (gameState.cursors.left.isDown) {
			gameState.player.setVelocityX(-160);
		} else if (gameState.cursors.right.isDown) {
			gameState.player.setVelocityX(160);
		} else if (gameState.cursors.up.isDown) {
            gameState.player.setVelocityY(-160)
        } else if (gameState.cursors.down.isDown){
            gameState.player.setVelocityY(160)
        }
        else {
			gameState.player.setVelocityX(0);
            gameState.player.setVelocityY(0);
		}
    }
}