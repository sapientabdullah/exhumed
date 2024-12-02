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

  constructor(camera: THREE.Camera, loadingManager: THREE.LoadingManager) {
    this.listener = new THREE.AudioListener();
    this.loadingManager = loadingManager;

    camera.add(this.listener);

    this.gunshotSound = this.loadSound('/audio/weapon/fire.mp3', 0.5, false);
    this.shellSound = this.loadSound(
      '/audio/weapon/bulletshells04.mp3',
      0.1,
      false
    );
    this.reloadSound = this.loadSound('/audio/weapon/reload.mp3', 0.5, false);
    this.footstepSound = this.loadSound('/audio/footsteps.mp3', 0.3, true);
    this.runningSound = this.loadSound('/audio/running.mp3', 0.3, true);
    this.jumpSound = this.loadSound('/audio/weapon/jump.wav', 0.5, false);
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
}
