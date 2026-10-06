import * as THREE from 'three';

export class GameScene {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a2a3a);
    this.scene.fog = new THREE.Fog(0x1a2a3a, 30, 80);

    // Kamera - ustten acili (top-down isometric benzeri)
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(0, 22, 18);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);

    // Isiklar
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(10, 30, 10);
    dir.castShadow = true;
    this.scene.add(dir);

    // Arena zemini
    const groundGeo = new THREE.PlaneGeometry(40, 40);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x2d5a3d });
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    // Duvarlar (basit kutular)
    this.createWalls();

    // Oyuncu karakteri (simdilik renkli kapsul - ozgun model sonra)
    this.player = this.createCharacter(0xff6b35);
    this.scene.add(this.player);

    // Diger oyuncular / botlar icin placeholder
    this.others = [];

    // Kontroller
    this.keys = {};
    this.moveDir = new THREE.Vector2(0, 0);
    this.aimDir = new THREE.Vector2(0, 1);
    this.speed = 8;
    this.hp = 100;
    this.superCharge = 0;

    this.setupInput();
    window.addEventListener('resize', () => this.onResize());
  }

  createCharacter(color) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.6, 1.2, 4, 8),
      new THREE.MeshStandardMaterial({ color })
    );
    body.castShadow = true;
    body.position.y = 1.2;
    group.add(body);

    // Kafa
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xffddaa })
    );
    head.position.y = 2.4;
    group.add(head);

    return group;
  }

  createWalls() {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
    const positions = [
      [0, 0, -18], [0, 0, 18], [-18, 0, 0], [18, 0, 0],
      [-8, 0, -8], [8, 0, 8], [-8, 0, 8], [8, 0, -8]
    ];
    positions.forEach(([x, y, z]) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 3), wallMat);
      wall.position.set(x, 1, z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      this.scene.add(wall);
    });
  }

  setupInput() {
    window.addEventListener('keydown', (e) => { this.keys[e.code] = true; });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });

    // Mouse nişan (PC)
    window.addEventListener('mousemove', (e) => {
      // Basit: ekran merkezine gore
      const dx = e.clientX - window.innerWidth / 2;
      const dy = e.clientY - window.innerHeight / 2;
      this.aimDir.set(dx, -dy).normalize();
    });

    // Sol tik saldiri
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.attack();
      if (e.button === 2) this.useSuper();
    });
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  attack() {
    // Basit mermi efekti (simdilik konsol)
    console.log('Saldiri!', this.aimDir);
    this.superCharge = Math.min(100, this.superCharge + 8);
    this.updateBars();
  }

  useSuper() {
    if (this.superCharge >= 100) {
      console.log('SUPER!');
      this.superCharge = 0;
      this.updateBars();
    }
  }

  updateBars() {
    const hpFill = document.getElementById('hp-fill');
    const superFill = document.getElementById('super-fill');
    if (hpFill) hpFill.style.width = this.hp + '%';
    if (superFill) superFill.style.width = this.superCharge + '%';
  }

  update(dt) {
    // WASD hareket
    let mx = 0, mz = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) mz -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) mz += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) mx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) mx += 1;

    if (mx !== 0 || mz !== 0) {
      const len = Math.sqrt(mx * mx + mz * mz);
      mx /= len; mz /= len;
      this.player.position.x += mx * this.speed * dt;
      this.player.position.z += mz * this.speed * dt;

      // Sinir
      this.player.position.x = Math.max(-18, Math.min(18, this.player.position.x));
      this.player.position.z = Math.max(-18, Math.min(18, this.player.position.z));
    }

    // Kamera takip
    this.camera.position.x = this.player.position.x;
    this.camera.position.z = this.player.position.z + 18;
    this.camera.lookAt(this.player.position.x, 0, this.player.position.z);

    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  destroy() {
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}