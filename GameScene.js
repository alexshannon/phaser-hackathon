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
	
        this.load.audio('atmos1', './assets/Game_Audio/atmos1_1.mp3')
        this.load.audio('main_theme', './assets/Game_Audio/main_theme.mp3')
        this.load.audio('world_music', './assets/Game_Audio/world_music.mp3')
        this.load.audio('victory_music', './assets/Game_Audio/victory_music.mp3')
        this.load.audio('package_col', './assets/Game_Audio/package_col.mp3')
        this.load.audio('package_del', './assets/Game_Audio/package_del.mp3')
        this.load.audio('step1', './assets/Game_Audio/step1.mp3')
        this.load.audio('step2', './assets/Game_Audio/step2.mp3')
        this.load.audio('step3', './assets/Game_Audio/step3.mp3')
        //this.load.audio('', './assets/Game_Audio/.mp3')
    }
    create(){      
        gameState.player = this.physics.add.sprite(0, 0, 'player').setDepth(2);
        gameState.player.setCollideWorldBounds(true);
        gameState.cursors = this.input.keyboard.createCursorKeys();
        
        //creates world, follows player
        //I'm not proud of this, but guarantees that we won't get worlds without packages lol
        while(packageCount === 0){
            this.worldGen()
        }
        this.cameras.main.setBounds(0, 0, 1800, 1200)
        this.physics.world.setBounds(0, 0, 1800, 1200)
        this.cameras.main.startFollow(gameState.player, false, 0.5, 0.5)
        this.physics.add.collider(gameState.player, gameState.house)
        this.physics.add.overlap(gameState.player, gameState.packages, collectPackage, null, this)
        this.physics.add.overlap(gameState.packages, gameState.house, collectPackage, null, this)
        function collectPackage (player, box){
            box.destroy()
	        package_col.play()
            console.log('Package collected!')
            if(packageCount > 1){
                packageCount--;
                scoreText.setText(`Packages Left: ${packageCount}`)
            } else {
                this.physics.pause()
                scoreText.setText('Good job porter! \nAll Packages have been collected.')
		        world_music.stop();
                atmos.stop();
		        victory_music.play();
		
            }
        }
        this.physics.add.collider(gameState.player, gameState.birds, () => {
            this.physics.pause()
            scoreText.setText(`Demons have prevented your delivery.\nThere were only ${packageCount} packages left.`, { fontSize: '25px', fill: '#FF00FF' })
            world_music.stop();
            atmos.stop();
        })
        this.physics.add.collider(gameState.player, gameState.hunter, () => {
            this.physics.pause()
            scoreText.setText(`Demons have prevented your delivery.\nThere were only ${packageCount} packages left.`, { fontSize: '25px', fill: '#FF00FF' })
            world_music.stop();
            atmos.stop();
        })
        let scoreText = this.add.text(0, 0, `Packages Left: ${packageCount}`, { fontSize: '25px', fill: '#FF00FF' }).setScrollFactor(0).setDepth(3)
	

        //add audio
        let package_col = this.sound.add('package_col');
        //let package_del = this.sound.add('package_del');
        let victory_music = this.sound.add('victory_music');
        let world_music = this.sound.add('world_music', {
            mute: false,
            volume: 0.5,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0
        });
        world_music.play();
        let atmos = this.sound.add('atmos1', {
            mute: false,
            volume: 1,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0
        });
        atmos.play(); 



//need a solution here:
	//player footsteps loop function
	    const step1 = this.sound.add('step1')
	    const step2 = this.sound.add('step2')
	    const step3 = this.sound.add('step3')
	    function walkingGen () {
		let pWalking = [step1, step2, step3];
        pWalking[Math.floor(Math.random() * pWalking.length)].play();
	    }
        
	    
    }
    update(){
        if (gameState.cursors.left.isDown) {
			gameState.player.setVelocityX(-160);
            const walkingLoop = this.time.addEvent({
                callback: walkingGen,
                delay: 100,
                callbackScope: this,
                loop: true,
            });
            walkingLoop;
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
        const packageChange = 10;
        const hunterChance = 25;
        let hunterSpawned = false;
        //creates the group for the collidable houses
        gameState.house = this.physics.add.staticGroup();
        gameState.birds = this.physics.add.group();
        gameState.packages = this.physics.add.staticGroup();
        gameState.hunter = this.physics.add.staticGroup();
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
                    if(genCount === 0){
                        this.physics.add.sprite(200 * genCount, 200*genYCount, 'road').setDepth(1);
                    } else{
                        gameState.house.create(200 * genCount, 200*genYCount, tileType).setDepth(1)
                        collidables.push([200 * genCount, 200*genYCount, tileType])
                    }
                } else {
                    let birdGen = Math.floor(Math.random() * birdChance)
                    let packageGen = Math.floor(Math.random() * packageChange)
                    let hunterGen = Math.floor(Math.random() * hunterChance)
                    if(birdGen === 1 && genYCount >= 3 && genCount >= 3){
                        gameState.birds.create(200 * genCount, 200*genYCount, 'bird').setDepth(1)
                        console.log('bird')
                    } 
                    if(packageGen == 1 && genCount != 0 && genYCount != 0 && genCount != 9 && genYCount != 6){
                        gameState.packages.create(200 * genCount, 200*genYCount, 'box').setDepth(4)
                        packageCount++;
                    }
                    if(hunterGen >= 3 && hunterSpawned === false && genYCount >= 3 && genCount >= 4){
                        gameState.hunter.create(200 * genCount, 200*genYCount, 'hunter').setDepth(1)
                        hunterSpawned = true;
                    }
                }
                
                this.physics.add.sprite(200 * genCount, 200*genYCount, tileType);
                console.log('added')
            }
        }
    }
}
