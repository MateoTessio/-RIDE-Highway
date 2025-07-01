export default class Scene3 extends Phaser.Scene {
  constructor() {
    super("Scene3");
  }

  preload() {
    this.load.image('fondo3',       'public/assets/images/fondo3.png');
    this.load.image('boton',       'public/assets/images/boton.png');
    this.load.audio('button',       'public/assets/sfx/button.mp3');
    this.load.audio('trackend',    'public/assets/tracks/trackend.mp3');
    this.load.audio('crash',       'public/assets/sfx/crash.mp3');
  
  }
  init(data) {
    // recibe el dato enviado
    this.finalCount = data.finalCount;
  }

  create() {
    const { width, height } = this.scale;
    this.add.image(0, 0, 'fondo3')
      .setOrigin(0)
      .setDisplaySize(width, height)
      .setDepth(0);

    this.track = this.sound.add('trackend', {
    loop: true,
    volume: 0.3,
    rate: 1
  });
  this.button = this.sound.add('button', {
    loop: false,
    volume: 0.5,
    rate: 1
  });
  this.crash = this.sound.add('crash', {
    loop: false,
    volume: 0.5,
    rate: 1
  });
  this.crash.play();
  this.crash.once( 'complete', () => {
    this.track.play();
  });

      const btn = this.add.image(width / 2, height * 0.8, 'boton')
      .setScale(0.6)
      .setDepth(2)
      .setInteractive({ useHandCursor: true });

    this.maxText = this.add.text(
      width - 300,
      height - 800,
      `${this.finalCount} km/h`,
      {
        fontFamily: 'Font1',
        fontSize: '80px',
        color: '#71ff4a',
        align: 'right'
      }
    )
    .setOrigin(1, 1)    // ancla en la esquina inferior derecha
    .setDepth(100);


    btn.on('pointerover', () => btn.setTint(0xdddddd));
    btn.on('pointerout',  () => btn.clearTint());

    btn.on('pointerdown', () => {
      btn.disableInteractive();
      this.button.play();
      this.time.delayedCall(1500, () => {
        this.track.stop();
    this.scene.stop('Scene3');
    this.scene.start('Scene1');
  });
});


  }

  update() {
    
  }
}
