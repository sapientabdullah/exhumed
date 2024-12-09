import * as THREE from 'three';
export class AudioManager {
  private listener: THREE.AudioListener;
  private loadingManager: THREE.LoadingManager;

  public gunshotSound: THREE.Audio;
  public shellSound: THREE.Audio;
  public reloadSound: THREE.Audio;
  public footstepSound: THREE.Audio;
  public runningSound: THREE.Audio;
  public jumpSound: THREE.Audio;
  public playerDeathSound: THREE.Audio;
  public playerPainSounds: THREE.Audio[];
  public zombieSounds: THREE.Audio[];
  public lurkingBossZombieSound: THREE.Audio;
  public zombieBossDeathSound: THREE.Audio;

  constructor(camera: THREE.Camera, loadingManager: THREE.LoadingManager) {
    this.listener = new THREE.AudioListener();
    this.loadingManager = loadingManager;

    camera.add(this.listener);

    this.gunshotSound = this.loadSound(
      '/audio/weapon-sounds/fire.wav',
      1,
      false
    );
    this.shellSound = this.loadSound(
      '/audio/weapon-sounds/bulletshells.mp3',
      0.3,
      false
    );
    this.reloadSound = this.loadSound(
      '/audio/weapon-sounds/reload.mp3',
      0.5,
      false
    );
    this.footstepSound = this.loadSound(
      '/audio/player-sounds/footsteps.mp3',
      0.3,
      true
    );
    this.runningSound = this.loadSound(
      '/audio/player-sounds/running.mp3',
      0.3,
      true
    );
    this.jumpSound = this.loadSound(
      '/audio/player-sounds/jump.wav',
      0.5,
      false
    );
    this.playerDeathSound = this.loadSound(
      '/audio/player-sounds/death.wav',
      0.7,
      false
    );
    this.playerPainSounds = [
      this.loadSound('/audio/player-sounds/pain1.wav', 0.7, false),
      this.loadSound('/audio/player-sounds/pain2.wav', 0.7, false),
      this.loadSound('/audio/player-sounds/pain3.wav', 0.7, false),
      this.loadSound('/audio/player-sounds/pain4.wav', 0.7, false),
      this.loadSound('/audio/player-sounds/pain5.wav', 0.7, false),
      this.loadSound('/audio/player-sounds/pain6.wav', 0.7, false),
      this.loadSound('/audio/player-sounds/pain7.wav', 0.7, false),
      this.loadSound('/audio/player-sounds/pain8.wav', 0.7, false),
    ];
    this.zombieSounds = [
      this.loadSound('/audio/zombie-sounds/zombie1.wav', 0.2, false),
      this.loadSound('/audio/zombie-sounds/zombie2.wav', 0.2, false),
      this.loadSound('/audio/zombie-sounds/zombie3.wav', 0.2, false),
      this.loadSound('/audio/zombie-sounds/zombie4.wav', 0.2, false),
      this.loadSound('/audio/zombie-sounds/zombie5.wav', 0.2, false),
      this.loadSound('/audio/zombie-sounds/zombie6.wav', 0.2, false),
      this.loadSound('/audio/zombie-sounds/zombie7.wav', 0.2, false),
    ];
    this.lurkingBossZombieSound = this.loadSound(
      '/audio/boss-sounds/lurking-boss.mp3',
      0.7,
      false
    );
    this.zombieBossDeathSound = this.loadSound(
      '/audio/boss-sounds/boss-death.mp3',
      0.7,
      false
    );
  }

  private loadSound(
    filePath: string,
    volume: number,
    loop: boolean
  ): THREE.Audio {
    const audio = new THREE.Audio(this.listener);
    const audioLoader = new THREE.AudioLoader(this.loadingManager);

    audioLoader.load(filePath, (buffer) => {
      audio.setBuffer(buffer);
      audio.setVolume(volume);
      audio.setLoop(loop);
    });

    return audio;
  }

  public playRandomPainSound(): void {
    const randomIndex = Math.floor(
      Math.random() * this.playerPainSounds.length
    );
    const randomPainSound = this.playerPainSounds[randomIndex];
    randomPainSound.play();
  }

  public playRandomZombieSound(): void {
    const randomIndex = Math.floor(Math.random() * this.zombieSounds.length);
    const randomZombieSound = this.zombieSounds[randomIndex];
    randomZombieSound.play();
  }
}
