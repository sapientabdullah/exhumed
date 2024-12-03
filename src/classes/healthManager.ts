export class HealthManager {
  private playerHealth: number;
  private readonly maxHealth: number;
  private healthDecreaseInterval: ReturnType<typeof setInterval> | undefined =
    undefined;
  private healthDisplay: HTMLElement | null;

  constructor(initialHealth: number, maxHealth: number) {
    this.playerHealth = initialHealth;
    this.maxHealth = maxHealth;
    this.healthDisplay = document.getElementById('health-display');
    this.updateHealthDisplay();
  }

  startHealthDecay(decayAmount: number, interval: number): void {
    if (!this.healthDecreaseInterval) {
      this.healthDecreaseInterval = setInterval(() => {
        if (this.playerHealth > 0) {
          this.playerHealth -= decayAmount;
          this.updateHealthDisplay();
        } else {
          this.stopHealthDecay();
          console.log('Player is dead');
        }
      }, interval);
    }
  }

  stopHealthDecay(): void {
    if (this.healthDecreaseInterval) {
      clearInterval(this.healthDecreaseInterval);
      this.healthDecreaseInterval = undefined;
    }
  }

  private updateHealthDisplay(): void {
    if (this.healthDisplay) {
      this.healthDisplay.textContent = `${this.playerHealth} / ${this.maxHealth}`;
    }
  }

  isPlayerAlive(): boolean {
    return this.playerHealth > 0;
  }
}
