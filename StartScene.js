class StartScene extends Phaser.Scene {
	constructor() {
		super({ key: 'StartScene' })
	}
	preload() {
		this.load.audio('main_theme', './assets/Game_Audio/main_theme.mp3')
	}
	create() {
		this.add.text(95, 250, 'Click to Start!', { fontSize: '30px', fill: '#FFFFFF' });
		let main_theme = this.sound.add('main_theme', {
		    mute: false,
		    volume: 1,
		    rate: 1,
		    detune: 0,
		    seek: 0,
		    loop: true,
		    delay: 0
		});
		main_theme.play(config); 
		
		this.input.on('pointerdown', () => {
			this.scene.stop('StartScene')
			main_theme.stop();
			this.scene.start('GameScene')
		})
	}
}
