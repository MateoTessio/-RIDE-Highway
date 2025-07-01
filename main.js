import Scene1 from "./scenes/Scene1.js";
import Scene2 from "./scenes/Scene2.js";
import Scene3 from "./scenes/Scene3.js";
import Scene4 from "./scenes/Scene4.js";


const config = {
  type: Phaser.AUTO,
  width: 1080,
  height: 1920,
  physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: { width: 800, height: 400 },
    max: { width: 1080, height: 1920 },
    input: {
    activePointers: 3    // hasta 3 toques simultáneos
  },
  },
  scene: [Scene2, Scene1, Scene3, Scene4]
};

window.game = new Phaser.Game(config);
