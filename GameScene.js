const collidables = [];
let packageCount = 0;
let birdCount = 0;
let hunterCount = 0;
let finalGen = false;
let collisionSet = false;

const worldX = 1800;
const worldY = 1200;

const birdSpeed = 160;
const hunterSpeed = 160;
let playerSpeed;

class GameScene extends Phaser.Scene {
	constructor(){
		super( {key: 'GameScene'} )
	}
    preload(){
        this.load.spritesheet('player', './assets/spritesheets/porter-spritesheet.png', {frameWidth: 60, frameHeight: 60})
        this.load.image('road', './assets/placeholder-textures/road.jpg')
        this.load.image('house', './assets/placeholder-textures/house.jpg')
        this.load.image('grass', './assets/placeholder-textures/grass.jpg')
        this.load.image('box', './assets/placeholder-textures/box_resize.png')
        this.load.spritesheet('bird', './assets/spritesheets/bird-spritesheet.png', {frameWidth: 60, frameHeight: 60})
        this.load.spritesheet('hunter', './assets/spritesheets/hunter-spritesheet.png', {frameWidth: 90, frameHeight: 90})

        //audio tracks
        this.load.audio('atmos1', './assets/Game_Audio/atmos1_1.mp3')
        this.load.audio('main_theme', './assets/Game_Audio/main_theme.mp3')
        this.load.audio('world_music', './assets/Game_Audio/world_music.mp3')
        this.load.audio('victory_music', './assets/Game_Audio/victory_music.mp3')
        this.load.audio('package_col', './assets/Game_Audio/package_col.mp3')
        this.load.audio('package_del', './assets/Game_Audio/package_del.mp3')
        this.load.audio('step1', './assets/Game_Audio/step1.mp3')
        this.load.audio('step2', './assets/Game_Audio/step2.mp3')
        this.load.audio('step3', './assets/Game_Audio/step3.mp3')
    }
    create(){
        gameState.player = this.physics.add.sprite(0, 0, 'player').setDepth(2);
        gameState.player.direction = 'down';
		gameState.player.isRun = false;
        gameState.player.setCollideWorldBounds(true);
        gameState.cursors = this.input.keyboard.createCursorKeys();
        //creates world, follows player, sets collisions
        this.worldGen();
        this.cameras.main.setBounds(0, 0, 1800, 1200);
        this.physics.world.setBounds(0, 0, 1800, 1200);
        gameState.scoreText = this.add.text(0, 0, `Packages Left: ${packageCount}`, { fontSize: '25px', fill: '#FF00FF' }).setScrollFactor(0).setDepth(3);
        this.cameras.main.startFollow(gameState.player, false, 0.5, 0.5);
        //music
        let world_music = this.sound.add('world_music', {
            mute: false,
            volume: 0.5,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0
        });
        let atmos = this.sound.add('atmos1', {
            mute: false,
            volume: 1,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0
        });

        //plays the music
        world_music.play();
        atmos.play(); 
        
        this.physics.add.collider(gameState.birds, gameState.player, (bird) => {
            world_music.stop();
            atmos.stop();
            this.physics.pause();
            gameState.scoreText.setText(`Demons have prevented your delivery.\nThere were only ${packageCount} packages left.`, { fontSize: '25px', fill: '#FF00FF' });
        })
        this.physics.add.collider(gameState.player, gameState.hunter, () => {
            world_music.stop();
            atmos.stop();
            this.physics.pause();
            gameState.scoreText.setText(`Demons have prevented your delivery.\nThere were only ${packageCount} packages left.`, { fontSize: '25px', fill: '#FF00FF' });
        })
        this.generateAnimations();
        gameState.alertPhase = false;
    }
    update(){
        //I'm not proud of this, but guarantees that we won't get worlds without packages lol
        if(packageCount === 0 || birdCount === 0 || hunterCount === 0 && finalGen === false){
            this.worldCleanUp();
            this.worldGen();
        } else {
            if(finalGen === false && collisionSet === false){
                finalGen = true
            }
        }
        //sprinting and player speed
        if(gameState.cursors.shift.isDown){
            playerSpeed = 250;
            gameState.player.isRun = true;
        } else {
            playerSpeed = 160;
            gameState.player.isRun = false;
        }

        //actual player movement code
        if (gameState.cursors.left.isDown) {
			gameState.player.setVelocityX(-playerSpeed);
            gameState.player.direction = 'side';
			if (gameState.player.isRun) {
				gameState.player.anims.play('porter_run_side', true);
			} else {
				gameState.player.anims.play('porter_walk_side', true);
			}
			gameState.player.flipX = false;
		} else if (gameState.cursors.right.isDown) {
			gameState.player.setVelocityX(playerSpeed);
            gameState.player.direction = 'side';
			if (gameState.player.isRun) {
				gameState.player.anims.play('porter_run_side', true);
			} else {
				gameState.player.anims.play('porter_walk_side', true);
			}
			gameState.player.flipX = true;
		} else if (gameState.cursors.up.isDown) {
            gameState.player.setVelocityY(-playerSpeed);
            gameState.player.direction = 'up';
			if (gameState.player.isRun) {
				gameState.player.anims.play('porter_run_up', true);
			} else {
				gameState.player.anims.play('porter_walk_up', true);
			}
        } else if (gameState.cursors.down.isDown){
            gameState.player.setVelocityY(playerSpeed);
            gameState.player.direction = 'down';
			if (gameState.player.isRun) {
				gameState.player.anims.play('porter_run_down', true);
			} else {
				gameState.player.anims.play('porter_walk_down', true);
			}
        }
        else {
			gameState.player.setVelocityX(0);
            gameState.player.setVelocityY(0);
            if (gameState.player.body.velocity.x === 0 && gameState.player.body.velocity.y === 0) {
                switch(gameState.player.direction){
                    case 'side':
                        gameState.player.anims.play('porter_idle_side', true);
                        break;
                    case 'up':
                        gameState.player.anims.play('porter_idle_up', true);
                        break;
                    case 'down':
                        gameState.player.anims.play('porter_idle_down', true);
                        break;
                }
            }
		}
        //sets collision with the world bounds for the enemies - will be using this to call detection functions on the player
        gameState.birds.getChildren().forEach(bird => {
            this.playerDetectBird(bird)
            if(bird.x === bird.width/2 || bird.y === bird.height/2 || bird.x === worldX - (bird.width/2) || bird.y === worldY - (bird.width/2)){
                this.setRandomBirdDirection(bird)
            }
        })
        gameState.hunter.getChildren().forEach(doggo => {
            this.playerDetectHunter(doggo)
            if(gameState.alertPhase){
                this.lookAtPlayer(doggo)
            }
            if(doggo.x === doggo.width/2 || doggo.y === doggo.height/2  || doggo.x === worldX-(doggo.width/2) || doggo.y === worldY-(doggo.height/2)){
                this.setRandomHunterDirection(doggo)
            }
        })
        //due to potentially having to regenerate the world, this simulates a one-time 'create' style function to intitalize things
        if(finalGen && collisionSet === false){
            //starts the enemies moving
            gameState.birds.getChildren().forEach(bird => {
                this.birdAi(bird, 'right')
            })
            gameState.hunter.getChildren().forEach(doggo => {
                this.hunterAi(doggo, 'up')
            })

            //sets all the colliders and enemy pathing
            this.physics.add.collider(gameState.player, gameState.house)
            this.physics.add.collider(gameState.player, gameState.birds)
            this.physics.add.collider(gameState.birds, gameState.house, this.setRandomBirdDirection, null, this)
            this.physics.add.collider(gameState.hunter, gameState.house, this.setRandomHunterDirection, null, this)
            this.physics.add.overlap(gameState.player, gameState.packages, collectPackage, null, this);


            //package and victory music needs to be declared here
            let package_col = this.sound.add('package_col');
            let victory_music = this.sound.add('victory_music');
            function collectPackage (player, box){
                box.destroy();
                package_col.play()
                if(packageCount > 1){
                    packageCount--;
                    gameState.scoreText.setText(`Packages Left: ${packageCount}`);
                } else {
                    victory_music.play();
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
        const packageChange = 10;

        //creates the groups for the objects
        gameState.house = this.physics.add.staticGroup();
        gameState.birds = this.physics.add.group();
        gameState.packages = this.physics.add.staticGroup();
        gameState.hunter = this.physics.add.group();
        gameState.enviroTiles = this.physics.add.group();

        let tileType;
        //gen is on the X axis, genY is Y axis
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
                        collidables.push([200 * genCount, 200*genYCount]);
                    }
                }
                if(tileType === 'road' || tileType === 'grass'){
                    let packageGen = Math.floor(Math.random() * packageChange);
                    if(packageGen == 1 && genCount != 0 && genYCount != 0 && genCount != 9 && genYCount != 6){
                        gameState.packages.create(200 * genCount, 200*genYCount, 'box').setDepth(3);
                        packageCount++;
                    }
                }
                if(tileType === 'road' || tileType === 'grass') {
                    let birdGen = Math.floor(Math.random() * birdCount + 1);
                    let hunterGen = Math.floor(Math.random() * hunterCount + 1);
                    if(birdGen === 1 && genYCount >= 3 && genCount >= 3 && genYCount != 0 && genCount != 9 && genYCount != 6){
                        let bird = this.physics.add.sprite(200 * genCount, 200*genYCount, 'bird').setDepth(2);
                        gameState.birds.add(bird)
                        bird.setCollideWorldBounds(true)
                        birdCount++;
                    } 
                    if(hunterGen === 1 && hunterCount === 0 && genYCount >= 3 && genCount >= 4 && genYCount != 0 && genCount != 9 && genYCount != 6){
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
    setRandomBirdDirection(entity){
        let randomDirection = Math.floor(Math.random() * 4)
        switch (randomDirection){
            case 0:
                this.birdAi(entity, 'right')
                break;
            case 1:
                this.birdAi(entity, 'left')
                break;
            case 2:
                this.birdAi(entity, 'up')
                break;
            case 3:
                this.birdAi(entity, 'down')
                break; 
        }
    }
    setRandomHunterDirection(entity){
        let randomDirection = Math.floor(Math.random() * 4)
        switch (randomDirection){
            case 0:
                this.hunterAi(entity, 'right')
                break;
            case 1:
                this.hunterAi(entity, 'left')
                break;
            case 2:
                this.hunterAi(entity, 'up')
                break;
            case 3:
                this.hunterAi(entity, 'down')
                break; 
        }
    }
    lookAtPlayer(entity){
        let x = entity.x
        let y = entity.y
        let playerX = gameState.player.x 
        let playerY = gameState.player.y
        
        if(playerX > x){
            entity.setVelocityX(hunterSpeed)
            entity.anims.play('hunter_alert_side', true);
			entity.flipX = true;
        }
        if(playerX < x){
            entity.setVelocityX(-hunterSpeed)
            entity.anims.play('hunter_alert_side', true);
        }
        if(playerX === x){
            entity.setVelocityX(0)
            entity.anims.play('hunter_alert_down', true);
        }
        if(playerY > y){
            entity.setVelocityY(hunterSpeed)
            entity.anims.play('hunter_alert_down', true);
        }
        if(playerY < y){
            entity.setVelocityY(-hunterSpeed)
            entity.anims.play('hunter_alert_up', true);
        }
        if(playerY === y){
            entity.setVelocityY(0)
            entity.anims.play('hunter_alert_down', true);
        }
    }
    birdAi(entity, direction){
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
            entity.setVelocityY(0)
            entity.anims.play('bird_walk_side', true);
			entity.flipX = true;
        }
        if(moveLeft === true){
            entity.setVelocityX(-birdSpeed);
            entity.setVelocityY(0)
            entity.anims.play('bird_walk_side', true);
			entity.flipX = false;
        }
        if(moveUp === true){
            entity.setVelocityY(-birdSpeed)
            entity.setVelocityX(0)
            entity.anims.play('bird_walk_up', true);
        }
        if(moveDown === true){
            entity.setVelocityY(birdSpeed);
            entity.setVelocityX(0)
            entity.anims.play('bird_walk_down', true);
        }
    }
   
    hunterAi(entity, direction){
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
            entity.setVelocityX(hunterSpeed);
            entity.setVelocityY(0)
            entity.anims.play('hunter_walk_side', true);
			entity.flipX = true;
        }
        if(moveLeft === true){
            entity.setVelocityX(-hunterSpeed);
            entity.setVelocityY(0)
            entity.anims.play('hunter_walk_side', true);
			entity.flipX = false;
        }
        if(moveUp === true){
            entity.setVelocityY(-hunterSpeed)
            entity.setVelocityX(0)
            entity.anims.play('hunter_walk_up', true);
        }
        if(moveDown === true){
            entity.setVelocityY(hunterSpeed);
            entity.setVelocityX(0)
            entity.anims.play('hunter_walk_down', true);
        }
    }
    playerDetectBird(bird){
        let xDistance = gameState.player.x - bird.x
        let yDistance = gameState.player.y - bird.y
        if(Math.abs(xDistance) < 200 && Math.abs(yDistance) < 200){
            //left
            if(gameState.alertPhase){
                bird.anims.play('bird_alert', true)
            }
            if(bird.body.velocity.x < 0 && xDistance < 0){
                bird.setVelocity(0)
                gameState.alertPhase = true;
            }
            //right
            if(bird.body.velocity.x > 0 && xDistance > 0){
                bird.setVelocity(0)
                gameState.alertPhase = true;
            }
            //up
            if(bird.body.velocity.y < 0 && yDistance < 0){
                bird.setVelocity(0)
                gameState.alertPhase = true;
            }
            //down
            if(bird.body.velocity.y > 0 && yDistance > 0){
                bird.setVelocity(0)
                gameState.alertPhase = true;
            }
        }
    }
    playerDetectHunter(doggo){
        let xDistance = gameState.player.x - doggo.x
        let yDistance = gameState.player.y - doggo.y
        if(Math.abs(xDistance) < 200 && Math.abs(yDistance) < 200){
            //left
            if(doggo.body.velocity.x < 0 && xDistance < 0){
                gameState.alertPhase = true;
            }
            //right
            if(doggo.body.velocity.x > 0 && xDistance > 0){
                gameState.alertPhase = true;
            }
            //up
            if(doggo.body.velocity.y < 0 && yDistance < 0){
                gameState.alertPhase = true;
            }
            //down
            if(doggo.body.velocity.y > 0 && yDistance > 0){
                gameState.alertPhase = true;
            }
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
    generateAnimations() {
		//Animations for Porter
		this.anims.create({
		key: 'porter_idle_down',
		frames: this.anims.generateFrameNumbers('player', { start: 0, end: 0 }),
		frameRate: 5,
		repeat: 0
		});
		this.anims.create({
			key: 'porter_idle_up',
			frames: this.anims.generateFrameNumbers('player', { start: 4, end: 4 }),
			frameRate: 5,
			repeat: 0
		});
		this.anims.create({
			key: 'porter_idle_side',
			frames: this.anims.generateFrameNumbers('player', { start: 8, end: 8 }),
			frameRate: 5,
			repeat: 0
		});
		this.anims.create({
			key: 'porter_walk_down',
			frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
			frameRate: 5,
			repeat: -1
		});
		this.anims.create({
			key: 'porter_walk_up',
			frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
			frameRate: 5,
			repeat: -1
		});
		this.anims.create({
			key: 'porter_walk_side',
			frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
			frameRate: 5,
			repeat: -1
		});
		this.anims.create({
			key: 'porter_run_down',
			frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
			frameRate: 10,
			repeat: -1
		});
		this.anims.create({
			key: 'porter_run_up',
			frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
			frameRate: 10,
			repeat: -1
		});
		this.anims.create({
			key: 'porter_run_side',
			frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
			frameRate: 10,
			repeat: -1
		});
		//Animations for Bird
		this.anims.create({
			key: 'bird_walk_down',
			frames: this.anims.generateFrameNumbers('bird', { start: 0, end: 3 }),
			frameRate: 2,
			repeat: -1
		});
		this.anims.create({
			key: 'bird_walk_up',
			frames: this.anims.generateFrameNumbers('bird', { start: 4, end: 7 }),
			frameRate: 2,
			repeat: -1
		});
		this.anims.create({
			key: 'bird_walk_side',
			frames: this.anims.generateFrameNumbers('bird', { start: 8, end: 11 }),
			frameRate: 2,
			repeat: -1
		});
		this.anims.create({
			key: 'bird_alert',
			frames: this.anims.generateFrameNumbers('bird', { start: 12, end: 15 }),
			frameRate: 7,
			repeat: -1
		});
		//Animations for Hunter
		this.anims.create({
			key: 'hunter_walk_down',
			frames: this.anims.generateFrameNumbers('hunter', { start: 0, end: 3 }),
			frameRate: 3,
			repeat: -1
		});
		this.anims.create({
			key: 'hunter_walk_up',
			frames: this.anims.generateFrameNumbers('hunter', { start: 4, end: 7 }),
			frameRate: 3,
			repeat: -1
		});
		this.anims.create({
			key: 'hunter_walk_side',
			frames: this.anims.generateFrameNumbers('hunter', { start: 8, end: 11 }),
			frameRate: 3,
			repeat: -1
		});
		this.anims.create({
			key: 'hunter_alert_down',
			frames: this.anims.generateFrameNumbers('hunter', { start: 12, end: 13 }),
			frameRate: 10,
			repeat: -1
		});
		this.anims.create({
			key: 'hunter_alert_up',
			frames: this.anims.generateFrameNumbers('hunter', { start: 14, end: 15 }),
			frameRate: 10,
			repeat: -1
		});
		this.anims.create({
			key: 'hunter_alert_side',
			frames: this.anims.generateFrameNumbers('hunter', { start: 16, end: 17 }),
			frameRate: 10,
			repeat: -1
		});
	}
}
