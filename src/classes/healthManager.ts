export class HealthManager {
  public playerHealth: number;
  public readonly maxHealth: number;
  private healthDecreaseInterval: ReturnType<typeof setInterval> | undefined =
    undefined;
  private healthDisplay: HTMLElement | null;

  constructor(initialHealth: number, maxHealth: number) {
    this.playerHealth = initialHealth;
    this.maxHealth = maxHealth;
    this.healthDisplay = document.getElementById('health-display');
    this.updateHealthDisplay();
  }

  resetHealth() {
    this.playerHealth = this.maxHealth;
    this.updateHealthDisplay();
  }

  get health(): number {
    return this.playerHealth;
  }

  startHealthDecay(decayAmount: number, interval: number): void {
    if (!this.healthDecreaseInterval) {
      this.healthDecreaseInterval = setInterval(() => {
        if (this.playerHealth > 0) {
          triggerBloodEffect();
          this.playerHealth -= decayAmount;
          this.updateHealthDisplay();
        } else {
          this.stopHealthDecay();
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
      const textElement = this.healthDisplay.querySelector('span');

      if (textElement) {
        textElement.textContent = `${this.playerHealth} / ${this.maxHealth}`;
      }

      const healthColor = this.getHealthColor();
      this.healthDisplay.style.color = healthColor;
    }
  }

  private getHealthColor(): string {
    const healthPercentage = (this.playerHealth / this.maxHealth) * 100;

    if (healthPercentage > 75) {
      return 'white';
    } else if (healthPercentage > 40) {
      return '#facc15';
    } else {
      return '#f87171';
    }
  }

  isPlayerAlive(): boolean {
    return this.playerHealth > 0;
  }
}

function triggerBloodEffect() {
  const bloodOverlay = document.getElementById('blood-overlay');

  if (bloodOverlay) {
    bloodOverlay.style.display = 'block';
    bloodOverlay.style.opacity = '1';

    setTimeout(() => {
      bloodOverlay.style.opacity = '0';
      setTimeout(() => {
        bloodOverlay.style.display = 'none';
      }, 300);
    }, 200);
  }
}
