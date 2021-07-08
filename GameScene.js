class GameScene extends Phaser.Scene {
	constructor(){
		super( {key: 'GameScene'} )
	}
    preload(){
        this.load.image('player', './assets/placeholder-textures/porter-front.png')
        this.load.image('road', './assets/placeholder-textures/road.jpg')
        this.load.image('house', './assets/placeholder-textures/house.jpg')
        this.load.image('grass', './assets/placeholder-textures/grass.jpg')
        this.load.image('box', './assets/placeholder-textures/box.png')
        this.load.image('bird', './assets/placeholder-textures/alert-bird-gray-red.png')
        this.load.image('hunter', './assets/placeholder-textures/hunter-front.png')
    }
    create(){
        gameState.player = this.physics.add.sprite(225, 450, 'player').setDepth(1);
        this.physics.add.sprite(225, 450, 'bird').setDepth(2)
        this.physics.add.sprite(225, 375, 'hunter').setDepth(2)
        gameState.player.setCollideWorldBounds(true);
        gameState.cursors = this.input.keyboard.createCursorKeys();
        this.worldGen()
        this.cameras.main.setBounds(0, 0, 1800, 1200)
        this.physics.world.setBounds(0, 0, 1800, 1200)
        this.cameras.main.startFollow(gameState.player, false, 0.5, 0.5)
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
    worldGen(){
        console.log('Generating world!')
        const tileOptions = 3;
        const collidable = this.physics.add.staticGroup();
        let tileType;
        for(let genYCount = 0; genYCount < 7; genYCount++){
            for(let genCount = 0; genCount < 10; genCount++){
                let randomColor = Math.floor(Math.random() * tileOptions)
                switch (randomColor){
                    case 0:
                        tileType = 'grass'
                        break; 
                    case 1:
                        tileType = 'road'
                        break;
                    case 2:
                        tileType = 'house'
                        break;
                }
                if(tileType === 'house'){
                   collidable.create(200 * genCount, 200*genYCount, tileType).setDepth(1)
                }
                
                this.physics.add.sprite(200 * genCount, 200*genYCount, tileType);
                console.log('added')
            }
        }
        this.physics.add.collider(gameState.player, collidable)
    }
}