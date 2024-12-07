import { camera, handleReload } from '../main';

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

export function handleMouseMove(event: MouseEvent) {
  if (document.pointerLockElement === document.body) {
    camera.rotation.y -= event.movementX / 500;
    camera.rotation.x -= event.movementY / 500;
    camera.rotation.x = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, camera.rotation.x)
    );
  }
}

export function handleMouseClick() {
  if (document.pointerLockElement !== document.body) {
    document.body.requestPointerLock();
  }
}

export function addEventListeners() {
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('click', handleMouseClick);
  document.addEventListener('keydown', handleReloadKey);
  document.addEventListener('keydown', handleEscapeKey);
}
