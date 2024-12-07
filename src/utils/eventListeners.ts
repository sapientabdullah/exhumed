import { camera, handleReload } from '../main';

let controlsVisible = true;

function handleReloadKey(event: KeyboardEvent) {
  if (event.code === 'KeyR') {
    handleReload();
  }
}

function handleEscapeKey(event: KeyboardEvent) {
  if (
    event.code === 'Escape' &&
    document.pointerLockElement === document.body
  ) {
    document.exitPointerLock();
  }
}

function handleControlsKey(event: KeyboardEvent) {
  if (event.code === 'KeyC') {
    const controlsElement = document.getElementById('controls');
    if (controlsElement) {
      controlsVisible = !controlsVisible;
      controlsElement.style.display = controlsVisible ? 'block' : 'none';
    }
  }
}

function handleMouseMove(event: MouseEvent) {
  if (document.pointerLockElement === document.body) {
    camera.rotation.y -= event.movementX / 500;
    camera.rotation.x -= event.movementY / 500;
    camera.rotation.x = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, camera.rotation.x)
    );
  }
}

function handleMouseClick() {
  if (document.pointerLockElement !== document.body) {
    document.body.requestPointerLock();
  }
}

export function addEventListeners() {
  document.addEventListener('click', handleMouseClick);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('keydown', handleReloadKey);
  document.addEventListener('keydown', handleEscapeKey);
  document.addEventListener('keydown', handleControlsKey);
}
