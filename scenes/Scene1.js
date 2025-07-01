export default class Scene1 extends Phaser.Scene {
  constructor() {
    super("Scene1");
  }

  preload() {
    this.load.image('moto',       'public/assets/images/moto.png');
    this.load.image('auto',       'public/assets/images/auto.png');
    this.load.image('fondo',      'public/assets/images/fondo.png');
    this.load.image('gas',        'public/assets/images/gas.png');
    this.load.image('camion',     'public/assets/images/camion.png');
    this.load.image('camioneta',  'public/assets/images/camioneta.png');
    this.load.image('barrera',    'public/assets/images/barrera.png');
    this.load.image('vel',        'public/assets/images/vel.png');
    this.load.image('bar1',        'public/assets/images/bar1.png');
    this.load.image('bar2',        'public/assets/images/bar2.png');
    this.load.audio('motor2',       'public/assets/sfx/motor2.mp3');
    this.load.audio('horn',       'public/assets/sfx/horn.mp3');
    this.load.audio('refill',       'public/assets/sfx/refill.mp3');
    this.load.audio('track1',    'public/assets/tracks/track1.mp3');
    this.load.audio('track2',    'public/assets/tracks/track2.mp3');
    
  }
  

  create() {
    const { width, height } = this.scale;

    // — parámetros de carriles —
    this.sideMargin  = width * 0.1;
    const usableWidth = width - 2 * this.sideMargin;
    const laneCount   = 3;
    this.laneWidth    = usableWidth / laneCount;
    this.laneCenters  = Array.from({ length: laneCount }, (_, i) =>
      this.sideMargin + this.laneWidth * i + this.laneWidth / 2
    );

    this.horn = this.sound.add('horn', {
    loop: false,
    volume: 0.3,
    rate: 1
  });
  
  this.refill = this.sound.add('refill', {
    loop: false,
    volume: 0.3,
    rate: 1
  });
  

    this.motor = this.sound.add('motor2', {
    loop: true,
    volume: 0.1,
    rate: 1
  });
  this.motor.play();

  const tracknum = Phaser.Math.Between(1, 2);
  if (tracknum === 1) {
    this.track = this.sound.add('track1', {
      loop: true,
      volume: 0.3,
      rate: 1
    });
  } else {
    this.track = this.sound.add('track2', {
      loop: true,
      volume: 0.3,
      rate: 1
    });
  }
  this.track.play();

    // — fondo y líneas en movimiento —
    this.add.image(140, 1680, 'bar2')
      .setOrigin(0)
      .setDisplaySize(width / 2, height / 14.5)
      .setDepth(80);
    this.add.image(100, 1680, 'bar1')
      .setOrigin(0)
      .setScale(0.8)
      .setDepth(90);
    this.add.image(180, 1400, 'vel')
      .setOrigin(0)
      .setScale(0.7)
      .setDepth(90);
    this.add.image(0, 0, 'fondo')
      .setOrigin(0)
      .setDisplaySize(width, height)
      .setDepth(0);

    this.dashLength = 100;
    this.gapLength  = 70;
    this.lineOffset = 0;
    this.lineSpeed  = 1500;
    this.fallingLines = this.add.graphics().setDepth(0);
    this._drawFallingLines();

    // — Moto —
    this.speedMoto = 1100;
    this.moto = this.physics.add.sprite(
      this.laneCenters[1], height - 650, 'moto'
    )
      .setCollideWorldBounds(true)
      .setScale(0.35)
      .setDamping(false)
      .setDragX(1000)
      .setMaxVelocity(this.speedMoto, 1200)
      .setDepth(5);

    // hitbox moto
    const motoW    = this.moto.displayWidth * 1.4;
    const motoH    = this.moto.displayHeight * 1.74;
    const motoOffX = this.moto.displayWidth - motoW + 165;
    const motoOffY = this.moto.displayHeight - motoH + 320;
    this.moto.body
      .setSize(motoW, motoH)
      .setOffset(motoOffX, motoOffY);

    // — Grupos y controles —
    this.autos      = this.physics.add.group({ immovable: false, allowGravity: false });
    this.camionetas = this.physics.add.group({ immovable: false,  allowGravity: false });
    this.camiones   = this.physics.add.group({ immovable: true,  allowGravity: false });
    this.gases      = this.physics.add.group();
    this.cursors    = this.input.keyboard.createCursorKeys();

    // — Grupo de barreras —
    this.barriers = this.physics.add.group({ immovable: true, allowGravity: false });
    this.physics.add.collider(this.moto, this.barriers,);

    // Arrancamos el spawn en cascada de barreras
    this.spawnBarrier();
    this.spawnRightBarrier();

    // — Parámetros de spawn & velocidad —
    this.velocidadAutos      = 400;
    this.incrementoVelocidad = 3;
    this.velocidadCamioneta  = 600;
    this.velocidadCamion     = 800;
    this.spawnDelay          = 3000;
    this.spawnMinDelay       = 1000;
    this.canSpawn            = true;
    this.counter             = 150;
    this.touchLeft  = false;
    this.touchRight = false;

    const leftZone = this.add
      .zone(0, 0, width/2, height)
      .setOrigin(0)
      .setInteractive();
    const rightZone = this.add
      .zone(width/2, 0, width/2, height)
      .setOrigin(0)
      .setInteractive();

    leftZone
      .on('pointerdown', () => this.touchLeft = true)
      .on('pointerup'  , () => this.touchLeft = false)
      .on('pointerout' , () => this.touchLeft = false);

    rightZone
      .on('pointerdown', () => this.touchRight = true)
      .on('pointerup'  , () => this.touchRight = false)
      .on('pointerout' , () => this.touchRight = false);


    const BOX_WIDTH = 200;  
    const BOX_HEIGHT = 100;  
    
    this.counterText = this.add.text(
      (width - BOX_WIDTH) / 2 + 530,
      height - 140,
      `${this.counter} `,
      {
        fontFamily: 'Font1',
        fontSize: '72px',
        fixedWidth: BOX_WIDTH,   
        color: '#71ff4a',
        align: 'center',

      })
    .setOrigin(1, 1)    // ancla en la esquina inferior derecha
    .setDepth(100);    // por encima de casi todo
    this.kmhText = this.add.text(
      width - 170,
      height - 100,
      `KM/H`,
      {
        fontFamily: 'Font1',
        fontSize: '34px',
        color: '#71ff4a',
        align: 'right'
      }
    )
    .setOrigin(1, 1)    // ancla en la esquina inferior derecha
    .setDepth(100);



    // Spawn autos periódicos
    this.spawnTimer = this.time.addEvent({
      delay: this.spawnDelay,
      callback: this.spawnAuto,
      callbackScope: this,
      loop: true
    });

    this.time.addEvent({
       delay: 1200,       
       loop: true,
       callback: () => {
        this.counter += 1;
        this.counterText.setText(`${this.counter} `);
      }
    });

    // Reducir delay y aumentar velocidad cada 0.5s
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        // spawn delay
        this.spawnDelay = Math.max(this.spawnMinDelay, this.spawnDelay - 10);
        this.spawnTimer.delay = this.spawnDelay;

        // velocidad de autos y camionetas
        this.velocidadAutos += this.incrementoVelocidad;
        this.autos.getChildren().forEach(a => a.setVelocityY(this.velocidadAutos));
        this.velocidadCamioneta += this.incrementoVelocidad;
        this.camionetas.getChildren().forEach(c => c.setVelocityY(this.velocidadCamioneta));
        this.velocidadCamion += this.incrementoVelocidad;
        this.camiones.getChildren().forEach(c => c.setVelocityY(this.velocidadCamion));

        // velocidad de líneas y barreras
        this.lineSpeed += this.incrementoVelocidad;
        this.barriers.getChildren().forEach(b => b.setVelocityY(this.lineSpeed));
      }
    });

    // Cada 10s: doble auto o camioneta
    this.time.addEvent({
      delay: 10000,
      loop: true,
      callback: () => {
        this.canSpawn = false;
        if (Phaser.Math.Between(0,1) === 0) {
          const lanes = Phaser.Utils.Array.Shuffle([0,1,2]);
          this.time.delayedCall(500, () => {
            this.spawnAutoEnLinea(lanes[0]);
            this.time.delayedCall(200, () => this.spawnAutoEnLinea(lanes[1]));
          });
        } else {
          this.time.delayedCall(500, () => {
          const lane = Phaser.Math.Between(0, this.laneCenters.length - 1);
          this.spawnCamionetaEnLinea(lane);
        })}
        this.time.delayedCall(1500, () => this.canSpawn = true);
      }
    });

    // Spawn gas cada 4s
    this.time.addEvent({
      delay: 4000,
      loop: true,
      callback: this.spawnGas,
      callbackScope: this
    });

    this.time.addEvent({
    delay: 45000,
    loop: true,
    callback: this.playAndSpawn,
    callbackScope: this
  });


    // — Colisiones —
    this.physics.add.overlap(this.moto, this.camionetas, () => {
      this.motor.stop();
      this.track.stop();
      this.scene.stop('Scene1');
      this.scene.start('Scene3' , { finalCount: this.counter });
    });
    this.physics.add.overlap(this.moto, this.camiones, () =>  {
      this.motor.stop();
      this.track.stop();
      this.scene.stop('Scene1');
      this.scene.start('Scene3', { finalCount: this.counter });
    });
    this.physics.add.overlap(this.moto, this.autos,      () => {
      this.motor.stop();
      this.track.stop();
      this.scene.stop('Scene1');
      this.scene.start('Scene3' , { finalCount: this.counter });
    });
    this.physics.add.overlap(this.moto, this.gases,       this.collectGas, null, this);
    this.physics.add.collider(this.autos, this.camionetas);
    this.physics.add.collider(this.autos, this.camiones);
    this.physics.add.collider(this.camionetas, this.camiones);
    // — Barra de combustible —
    this.maxFuel       = 100;
    this.fuel          = this.maxFuel;
    this.fuelDrainRate = 6.4;
    this.fuelBarMaxWidth = 400;
    this.barX      = 240;
    this.barHeight = 70;
    this.barY      = height - this.barHeight - 140;
    this.fuelBarBg = this.add.graphics()
      .fillStyle(0x000000, 0.6)
      .fillRoundedRect(this.barX, this.barY, this.fuelBarMaxWidth, this.barHeight, 20)
      .setDepth(100);
    this.fuelBar = this.add.graphics().setDepth(100);
    this._updateFuelBar();
  }

  update(time, delta) {
    const dt = delta / 1000;
    // — Drenar combustible —
    this.fuel = Phaser.Math.Clamp(this.fuel - this.fuelDrainRate * dt, 0, this.maxFuel);
    this._updateFuelBar();
    if (this.fuel <= 0) {
      {
      this.motor.stop();
      this.track.stop();
      this.scene.stop('Scene1');
      this.scene.start('Scene3' , { finalCount: this.counter });
    };
      return;
    }

    // — Control de la moto —
    this.moto.setAccelerationX(0);
    this.moto.rotation = Phaser.Math.Linear(
      this.moto.rotation,
      this.moto.body.velocity.x / this.speedMoto * 0.3,
      0.1
    );
    if (this.cursors.left.isDown || this.touchLeft)  this.moto.setAccelerationX(-this.speedMoto);
    else if (this.cursors.right.isDown || this.touchRight) this.moto.setAccelerationX(this.speedMoto);

    // — Destruir fuera de pantalla —
    [this.autos, this.camionetas,this.camiones, this.gases, this.barriers].forEach(group => {
      group.getChildren().forEach(obj => {
        if (obj.y > this.scale.height + obj.displayHeight) {
          obj.destroy();
        }
      });
    });

    // — Actualizar líneas “cayendo” —
    this.lineOffset += dt * this.lineSpeed;
    const cycle = this.dashLength + this.gapLength;
    if (this.lineOffset > cycle) this.lineOffset -= cycle;
    this._drawFallingLines();
  }

  // --- SPAWN BARRIER: no se solapan, salen justo detrás ---
  spawnBarrier() {
    const x = this.laneCenters[0] - this.laneWidth / 2 - 20;
    const b = this.barriers.create(x, -1500, 'barrera')
      .setOrigin(1, 0.5)
      .setScale(1.4)
      .setVelocityY(this.lineSpeed)
      .setDepth(0);

    // ajustar hitbox si quieres
    const w = b.displayWidth * 1;
    const h = b.displayHeight * 1.8;
    b.body.setSize(w, h).setOffset(0, 0);

    // calcular delay hasta que b haya avanzado su altura + gap
    const pixelGap = b.displayHeight + 50;
    const delayMs  = pixelGap / this.lineSpeed * 1000;

    this.time.delayedCall(delayMs, this.spawnBarrier, [], this);
  }

  spawnRightBarrier() {
  // Calcula la X justo a la derecha del último carril
  const x = this.laneCenters[this.laneCenters.length - 1] + this.laneWidth / 2 + 10;
  const b = this.barriers.create(x, -1500, 'barrera')
    .setOrigin(-0.2, 0.5) // ancla desde el borde izquierdo
    .setScale(1.4)
    .setFlipX(true)
    .setVelocityY(this.lineSpeed);

  // hitbox opcional
  const w = b.displayWidth * 1;
  const h = b.displayHeight * 1.8;
  b.body.setSize(w, h).setOffset(-15, 0);

  // mismo delay que en spawnBarrier()
  const pixelGap = b.displayHeight + 50;
  const delayMs  = pixelGap / this.lineSpeed * 1000;

  this.time.delayedCall(delayMs, this.spawnRightBarrier, [], this);
}

  // — Dibuja líneas entrecortadas —
  _drawFallingLines() {
    const { height } = this.scale;
    const cycle = this.dashLength + this.gapLength;
    this.fallingLines.clear().lineStyle(15, 0xffffff, 0.7);

    for (let i = 1; i < this.laneCenters.length; i++) {
      const x = this.sideMargin + this.laneWidth * i;
      for (let y = -cycle + this.lineOffset; y < height; y += cycle) {
        this.fallingLines.beginPath();
        this.fallingLines.moveTo(x, y);
        this.fallingLines.lineTo(x, y + this.dashLength);
        this.fallingLines.strokePath();
      }
    }
  }

  // --- SPAWN AUTOS/CAMIONETAS/GAS y recolectar gas ---

  spawnAuto() {
    if (!this.canSpawn) return;
    const limY = -150;
    const lanesLibres = this.laneCenters
      .map((_, i) => i)
      .filter(i =>
        !this.camionetas.getChildren()
          .some(cam =>
            Math.abs(cam.x - this.laneCenters[i]) < this.scale.width/6 &&
            cam.y < limY
          )
          &&
        !this.camiones.getChildren()
          .some(cam =>
            Math.abs(cam.x - this.laneCenters[i]) < this.scale.width/6 &&
            cam.y < limY
          )
      );
    if (lanesLibres.length === 0) return;
    const lane = Phaser.Utils.Array.GetRandom(lanesLibres);
    this.spawnAutoEnLinea(lane);
  }

  spawnAutoEnLinea(laneIndex) {
    const baseX     = this.laneCenters[laneIndex];
    const variacion = 28;
    const x         = baseX + Phaser.Math.Between(-variacion, variacion);
    const auto      = this.autos.create(x, -1000, 'auto')
      .setVelocityY(this.velocidadAutos)
      .setScale(0.9)
      .setDepth(2);

    // hitbox auto
    const w    = auto.displayWidth * 0.4;
    const h    = auto.displayHeight * 1.0;
    const offX = auto.displayWidth - w - 90;
    const offY = auto.displayHeight - h + 30;
    auto.body.setSize(w, h).setOffset(offX, offY);
  }
  spawnCamionEnLinea(laneIndex) {
  const baseX     = this.laneCenters[laneIndex];
  const variacion = 10;
  const x         = baseX + Phaser.Math.Between(-variacion, variacion);
  const camion    = this.camiones.create(x, -1000, 'camion')
    .setVelocityY(this.velocidadCamion)
    .setScale(0.5)
    .setDepth(2);

  const w    = camion.displayWidth * 1.08;
  const h    = camion.displayHeight * 1.93;
  const offX = (camion.displayWidth + 630) / 5;
  const offY = (camion.displayHeight - 690) / 5;
  camion.body.setSize(w, h).setOffset(offX, offY);
}
playAndSpawn() {
  this.horn.play();
  this.spawnCamion();
}

  spawnCamionetaEnLinea(laneIndex) {
    const baseX     = this.laneCenters[laneIndex];
    const variacion = 28;
    const x         = baseX + Phaser.Math.Between(-variacion, variacion);
    const cam       = this.camionetas.create(x, -1000, 'camioneta')
      .setVelocityY(this.velocidadCamioneta)
      .setScale(0.55)
      .setDepth(2);

    const w    = cam.displayWidth * 0.65;
    const h    = cam.displayHeight * 1.8;
    const offX = (cam.displayWidth + 1050) / 5;
    const offY = (cam.displayHeight - 500) / 5;
    cam.body.setSize(w, h).setOffset(offX, offY);
  }

  spawnGas() {
    const lane = Phaser.Math.Between(0, this.laneCenters.length - 1);
    this.spawnGasEnLinea(lane);
  }
  spawnCamion() {
    const lane = Phaser.Math.Between(0, this.laneCenters.length - 1);
    this.spawnCamionEnLinea(lane);
  }

  spawnGasEnLinea(laneIndex) {
    const baseX     = this.laneCenters[laneIndex];
    const variacion = 26;
    const x         = baseX + Phaser.Math.Between(-variacion, variacion);
    const gas       = this.gases.create(x, -1000, 'gas')
      .setVelocityY(this.velocidadAutos)
      .setScale(0.7)
      .setDepth(1);

    const w    = gas.displayWidth * 1.2;
    const h    = gas.displayHeight * 1.5;
    const offX = gas.displayWidth / 5;
    const offY = (gas.displayHeight - 320) / 5;
    gas.body.setSize(w, h).setOffset(offX, offY);
  }

  collectGas(moto, gas) {
    this.refill.play();
    gas.destroy();
    this.fuel = this.maxFuel;
    this._updateFuelBar();
  }

  // — Actualiza barra de combustible —
  _updateFuelBar() {
    const pct   = this.fuel / this.maxFuel;
    const w     = this.fuelBarMaxWidth * pct;
    let color   = 0x00ff00;
    if (pct < 0.5)  color = 0xffff00;
    if (pct < 0.25) color = 0xff0000;

    this.fuelBar.clear()
      .fillStyle(color, 1)
      .fillRoundedRect(this.barX, this.barY, w, this.barHeight, 20);
  }
}