class StartScene extends Phaser.Scene {
	constructor() {
		super({ key: 'StartScene' })
	}
	preload() {
		this.load.audio('main_theme', './assets/Game_Audio/main_theme.mp3')
		this.load.image('deliverance', './assets/placeholder-textures/deliverance_med.png')
	}
	create() {
		this.add.text(170, 380, 'Click to Start!', { fontSize: '30px', fill: '#FFFFFF' });
		this.add.text(200, 450, 'Use arrow keys to move \nHold shift to run', {fontSize: '15px', fill: '#FFFFFF'});
		this.add.image(300, 180, 'deliverance')
		let main_theme = this.sound.add('main_theme', {
		    mute: false,
		    volume: 1,
		    rate: 1,
		    detune: 0,
		    seek: 0,
		    loop: true,
		    delay: 0
		});
		main_theme.play(); 
		
		this.input.on('pointerdown', () => {
			this.scene.stop('StartScene')
			main_theme.stop();
			this.scene.start('GameScene')
		})
	}
}