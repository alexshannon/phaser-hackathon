const collidables = [];
let packageCount = 0;
let birdCount = 0;
let hunterCount = 0;
let finalGen = false;
let collisionSet = false;

const worldX = 1770;
const worldY = 1170;

const birdSpeed = 160;

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
            this.physics.pause();
            gameState.scoreText.setText(`Demons have prevented your delivery.\nThere were only ${packageCount} packages left.`, { fontSize: '25px', fill: '#FF00FF' });
        })
    }
    update(){
        //I'm not proud of this, but guarantees that we won't get worlds without packages lol
        if(packageCount === 0 || birdCount === 0 || hunterCount === 0 && finalGen === false){
            console.log('regenning...' + packageCount + ',' + birdCount +',' + hunterCount)
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
        gameState.birds.getChildren().forEach(bird => {
            if(bird.x === 30 || bird.y === 30 || bird.x === worldX || bird.y === worldY){
                this.setRandomDirection(bird)
            }
        })
        gameState.hunter.getChildren().forEach(doggo => {
            if(doggo.x === 45 || doggo.y === 45 || doggo.x === worldX-15 || doggo.y === worldY-15){
                this.setRandomDirection(doggo)
            }
        })
        if(finalGen && collisionSet === false){
            gameState.birds.getChildren().forEach(bird => {
                this.movementAi(bird, 'right')
            })
            gameState.hunter.getChildren().forEach(doggo => {
                this.movementAi(doggo, 'up')
            })

            this.physics.add.collider(gameState.player, gameState.house)
            this.physics.add.collider(gameState.player, gameState.birds)
            this.physics.add.collider(gameState.birds, gameState.house, this.setRandomDirection, null, this)
            this.physics.add.collider(gameState.hunter, gameState.house, this.setRandomDirection, null, this)
            this.physics.add.collider(gameState.birds, gameState.hunter, this.setRandomDirection, null, this)
            this.physics.add.collider(gameState.birds, gameState.birds, this.setRandomDirection, null, this)
            this.physics.add.overlap(gameState.player, gameState.packages, collectPackage, null, this);
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
            collisionSet = true;
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
                        let bird = this.physics.add.sprite(200 * genCount, 200*genYCount, 'bird').setDepth(2);
                        gameState.birds.add(bird)
                        bird.setCollideWorldBounds(true)
                        birdCount++;
                    } 
                    if(packageGen == 1 && genCount != 0 && genYCount != 0 && genCount != 9 && genYCount != 6){
                        gameState.packages.create(200 * genCount, 200*genYCount, 'box').setDepth(3);
                        packageCount++;
                    }
                    if(hunterGen >= 3 && hunterCount === 0 && genYCount >= 3 && genCount >= 4 && genYCount != 0 && genCount != 9 && genYCount != 6){
                        let doggo = this.physics.add.sprite(200 * genCount, 200*genYCount, 'hunter').setDepth(1);
                        gameState.hunter.add(doggo)
                        doggo.setCollideWorldBounds(true)
                        hunterCount++;
                    }
                }
                this.physics.add.sprite(200 * genCount, 200*genYCount, tileType);
            }
        }
    }
    setRandomDirection(entity){
        let randomDirection = Math.floor(Math.random() * 4)
        switch (randomDirection){
            case 0:
                this.movementAi(entity, 'right')
                break;
            case 1:
                this.movementAi(entity, 'left')
                break;
            case 2:
                this.movementAi(entity, 'up')
                break;
            case 3:
                this.movementAi(entity, 'down')
                break; 
        }
    }
    movementAi(entity, direction){
        let moveRight;
        let moveLeft;
        let moveUp;
        let moveDown;

        switch(direction){
            case 'right':
                moveRight = true;
                moveLeft = false;
                moveUp = false;
                moveDown = false;
                break;
            case 'left':
                moveRight = false;
                moveLeft = true;
                moveUp = false;
                moveDown = false;
                break;
            case 'up':
                moveRight = false;
                moveLeft = false;
                moveUp = true;
                moveDown = false;
                break;
            case 'down':
                moveRight = false;
                moveLeft = false;
                moveUp = false;
                moveDown = true;
                break;
        }
        if(moveRight){
            entity.setVelocityX(birdSpeed);
        }
        if(moveLeft === true){
            entity.setVelocityX(-birdSpeed);
        }
        if(moveUp === true){
            entity.setVelocityY(-birdSpeed)
        }
        if(moveDown === true){
            entity.setVelocityY(birdSpeed);
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
        gameState.packages.getChildren().forEach(x => {
           x.destroy()
        })
    }
}