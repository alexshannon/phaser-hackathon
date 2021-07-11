const collidables = []
let packageCount = 0

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
        gameState.player = this.physics.add.sprite(0, 0, 'player').setDepth(1);
        gameState.player.setCollideWorldBounds(true);
        gameState.cursors = this.input.keyboard.createCursorKeys();
        //creates world, follows player
        let world = this.worldGen()
        this.cameras.main.setBounds(0, 0, 1800, 1200)
        this.physics.world.setBounds(0, 0, 1800, 1200)
        this.cameras.main.startFollow(gameState.player, false, 0.5, 0.5)
        this.physics.add.collider(gameState.player, world.packages, (box) => {
            console.log(box)
        })
        this.physics.add.collider(gameState.player, world.birds, () => {
            this.physics.pause()
            scoreText.setText(`Demons have prevented your delivery.\n There were only ${packageCount} packages left.`, { fontSize: '25px', fill: '#FF00FF' })
        })
        let scoreText = this.add.text(0, 0, `Packages Left: ${packageCount}`, { fontSize: '25px', fill: '#FF00FF' }).setScrollFactor(0).setDepth(3)
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
        //math options for setting up the world
        const tileOptions = 5;
        const birdChance = 10;
        const packageChange = 25;
        const hunterChance = 25;
        let hunterSpawned = false;
        //creates the group for the collidable houses
        const collidable = this.physics.add.staticGroup();
        const birds = this.physics.add.group();
        const packages = this.physics.add.staticGroup();
        const hunter = this.physics.add.staticGroup();
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
                    case 3:
                        tileType = 'grass'
                        break; 
                    case 4:
                        tileType = 'road'
                        break;
                }
                if(tileType === 'house'){
                   collidable.create(200 * genCount, 200*genYCount, tileType).setDepth(1)
                   collidables.push([200 * genCount, 200*genYCount, tileType])
                } else {
                    let birdGen = Math.floor(Math.random() * birdChance)
                    let packageGen = Math.floor(Math.random() * packageChange)
                    let hunterGen = Math.floor(Math.random() * hunterChance)
                    if(birdGen === 1){
                        birds.create(200 * genCount, 200*genYCount, 'bird').setDepth(1)
                        console.log('bird')
                    } 
                    if(packageGen === 1){
                        packages.create(200 * genCount, 200*genYCount, 'box').setDepth(1)
                        packageCount++;
                    }
                    if(hunterGen === 1 && hunterSpawned === false && genYCount >= 3 && genCount >= 4){
                        hunter.create(200 * genCount, 200*genYCount, 'hunter').setDepth(1)
                        hunterSpawned = true;
                    }
                }
                
                this.physics.add.sprite(200 * genCount, 200*genYCount, tileType);
                console.log('added')
            }
        }
        this.physics.add.collider(gameState.player, collidable)
        const worldState = {birds, packages, hunter}
        return worldState
    }
}