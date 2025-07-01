export default class Scene2 extends Phaser.Scene {
  constructor() {
    super("Scene2");
  }

  preload() {
    this.load.image('fondo2',       'public/assets/images/fondo2.png');
    this.load.image('rueda',       'public/assets/images/rueda.png');
    this.load.image('boton',       'public/assets/images/boton.png');
    this.load.audio('button',       'public/assets/sfx/button.mp3');
    this.load.audio('trackintro',    'public/assets/tracks/trackintro.mp3');
  }

  create() {
    const { width, height } = this.scale;
    this.add.image(0, 0, 'fondo2')
      .setOrigin(0)
      .setDisplaySize(width, height)
      .setDepth(0);
      this.button = this.sound.add('button', {
    loop: false,
    volume: 0.5,
    rate: 1
  });
  this.track = this.sound.add('trackintro', {
    loop: true,
    volume: 0.5,
    rate: 1
  });
  this.track.play();

    this.add.image(215, 980, 'rueda')
      .setOrigin(0)
      .setDisplaySize(width, height)
      .setDepth(1)
      .setScale(0.6);
  const btn = this.add.image(width / 2, height * 0.8, 'boton')
      .setScale(0.6)
      .setDepth(2)
      .setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setTint(0xdddddd));
    btn.on('pointerout',  () => btn.clearTint());

    btn.on('pointerdown', () => {
      btn.disableInteractive();
      this.button.play();
      this.time.delayedCall(1500, () => {
      this.track.stop();
      this.scene.stop('Scene2');
      this.scene.start('Scene4');
  });
});
    
  }
  
  update() {
    
  }
}
