const collidables = [];
let packageCount = 0;
let birdCount = 0;
let hunterCount = 0;
let finalGen = false;
let collisionSet = false;
const worldX = 1800;
const worldY = 1200;

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
        gameState.player = this.physics.add.sprite(0, 0, 'player').setDepth(2);
        gameState.player.setCollideWorldBounds(true);
        gameState.cursors = this.input.keyboard.createCursorKeys();
        //creates world, follows player, sets collisions
        this.worldGen();
        this.cameras.main.setBounds(0, 0, 1800, 1200);
        this.physics.world.setBounds(0, 0, 1800, 1200);
        gameState.scoreText = this.add.text(0, 0, `Packages Left: ${packageCount}`, { fontSize: '25px', fill: '#FF00FF' }).setScrollFactor(0).setDepth(3);
        this.cameras.main.startFollow(gameState.player, false, 0.5, 0.5);
        this.physics.add.collider(gameState.birds, gameState.player, (bird) => {
            this.physics.pause();
            gameState.scoreText.setText(`Demons have prevented your delivery.\nThere were only ${packageCount} packages left.`, { fontSize: '25px', fill: '#FF00FF' });
        })
        this.physics.add.collider(gameState.player, gameState.hunter, () => {
            this.worldCleanUp()
            this.physics.pause();
            gameState.scoreText.setText(`Demons have prevented your delivery.\nThere were only ${packageCount} packages left.`, { fontSize: '25px', fill: '#FF00FF' });
        })
    }
    update(){
        //I'm not proud of this, but guarantees that we won't get worlds without packages lol
        if(packageCount === 0 || birdCount === 0 || hunterCount === 0 && finalGen === false){
            console.log('regenning...')
            this.worldCleanUp();
            this.worldGen();
        } else {
            if(finalGen === false && collisionSet === false){
                finalGen = true
            }
        }
        if (gameState.cursors.left.isDown) {
			gameState.player.setVelocityX(-160);
		} else if (gameState.cursors.right.isDown) {
			gameState.player.setVelocityX(160);
		} else if (gameState.cursors.up.isDown) {
            gameState.player.setVelocityY(-160);
        } else if (gameState.cursors.down.isDown){
            gameState.player.setVelocityY(160);
        }
        else {
			gameState.player.setVelocityX(0);
            gameState.player.setVelocityY(0);
		}
        if(finalGen){
            gameState.birds.getChildren().forEach(bird => {
                this.birdAi(bird)
            })
            this.physics.add.collider(gameState.player, gameState.house)
            this.physics.add.collider(gameState.player, gameState.birds)
            this.physics.add.overlap(gameState.player, gameState.packages, collectPackage, null, this);
            gameState.packages.getChildren().forEach(box => {
                console.log(box)
            })
            function collectPackage (player, box){
                box.destroy();
                console.log('Package collected!');
                if(packageCount > 1){
                    packageCount--;
                    gameState.scoreText.setText(`Packages Left: ${packageCount}`);
                } else {
                    this.physics.pause();
                    gameState.scoreText.setText('Good job porter! \nAll Packages have been collected.');
                }
            }
        }
    }
    worldGen(){
        //math options for setting up the world
        const tileOptions = 5;
        const birdChance = 10;
        const packageChange = 10;
        const hunterChance = 25;

        //creates the groups for the objects
        gameState.house = this.physics.add.staticGroup();
        gameState.birds = this.physics.add.group();
        gameState.packages = this.physics.add.staticGroup();
        gameState.hunter = this.physics.add.group();
        gameState.enviroTiles = this.physics.add.group();


        let tileType;
        for(let genYCount = 0; genYCount < 7; genYCount++){
            for(let genCount = 0; genCount < 10; genCount++){
                let randomColor = Math.floor(Math.random() * tileOptions);
                switch (randomColor){
                    case 0:
                        tileType = 'grass';
                        break; 
                    case 1:
                        tileType = 'road';
                        break;
                    case 2:
                        tileType = 'house';
                        break;
                    case 3:
                        tileType = 'grass';
                        break; 
                    case 4:
                        tileType = 'road';
                        break;
                }
                if(tileType === 'house'){
                    if(genCount === 0){
                       gameState.enviroTiles.create(200 * genCount, 200*genYCount, 'road').setDepth(1);
                    } else{
                        gameState.house.create(200 * genCount, 200*genYCount, tileType).setDepth(1);
                        collidables.push([200 * genCount, 200*genYCount, tileType]);
                    }
                } else {
                    let birdGen = Math.floor(Math.random() * birdChance);
                    let packageGen = Math.floor(Math.random() * packageChange);
                    let hunterGen = Math.floor(Math.random() * hunterChance);
                    if(birdGen === 1 && genYCount >= 3 && genCount >= 3 && genYCount != 0 && genCount != 9 && genYCount != 6){
                        gameState.birds.create(200 * genCount, 200*genYCount, 'bird').setDepth(2);
                        birdCount++;
                    } 
                    if(packageGen == 1 && genCount != 0 && genYCount != 0 && genCount != 9 && genYCount != 6){
                        gameState.packages.create(200 * genCount, 200*genYCount, 'box').setDepth(3);
                        packageCount++;
                    }
                    if(hunterGen >= 3 && hunterCount === 0 && genYCount >= 3 && genCount >= 4 && genYCount != 0 && genCount != 9 && genYCount != 6){
                        gameState.hunter.create(200 * genCount, 200*genYCount, 'hunter').setDepth(1);
                        hunterCount++;
                    }
                }
                this.physics.add.sprite(200 * genCount, 200*genYCount, tileType);
                console.log('added')
            }
        }
    }
    birdAi(bird){
        let moveRight;
        let moveLeft;
        let moveUp;
        let moveDown = true;

        if(moveRight === true && bird.x <= worldX){
            bird.x += 3;
        }
        if(moveLeft === true && bird.x >= 0){
            bird.x -= 3;
        }
        if(moveUp === true && bird.y >= 0){
            bird.y -= 3;
        }
        if(moveDown === true && bird.y <= worldY){
            bird.y += 3;
        }
    }
    worldCleanUp(){
        packageCount = 0
        birdCount = 0
        hunterCount = 0
        gameState.birds.getChildren().forEach(bird => {
            bird.destroy()
        })
        gameState.enviroTiles.getChildren().forEach(tile => {
            tile.destroy()
        })
        gameState.house.getChildren().forEach(house => {
            house.destroy()
        })
        gameState.hunter.getChildren().forEach(hunter => {
            hunter.destroy()
        })
        gameState.packages.getChildren().forEach(box => {
           box.destroy()
        })
    }
}