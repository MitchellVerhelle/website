'use client';

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

type Props = { onInteract?: () => void };

const ROT_TIGHT = Phaser.Math.DegToRad(300);
const ROT_WIDE  = Phaser.Math.DegToRad( 60);
const BRAKE_ACCEL = 700;     // stronger opposite thrust when you press “reverse”
const TURN_SLOW   = 4;       // extra decel (1/s) while coasting + steering
const DRAG_COAST  = 120;   // gentle roll‑off
const DRAG_ACTIVE = 600;   // strong resistance when keys held



export default function GameCanvas({ onInteract }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!hostRef.current || gameRef.current) return;

    /* constants */
    const WORLD = 2000;
    const SIZE  = 32;
    const ACCEL = 400;
    const MAX_SPEED = 260;
    const GRIP  = 8;

    class MainScene extends Phaser.Scene {
      player!: Phaser.Physics.Arcade.Sprite;
      cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
      keyA!: Phaser.Input.Keyboard.Key;
      keyD!: Phaser.Input.Keyboard.Key;
      clickTarget: Phaser.Math.Vector2 | null = null;
      targetAngle: number | null = null;

      preload() {
        /* checkerboard + player textures */
        const g = this.add.graphics();
        g.fillStyle(0x3d3d3d).fillRect(0, 0, 64, 64);
        g.fillStyle(0x2f2f2f).fillRect(0, 0, 32, 32);
        g.fillRect(32, 32, 32, 32);
        g.generateTexture('floor', 64, 64);
        g.clear().fillStyle(0x000000).fillRect(0, 0, SIZE, SIZE);
        g.generateTexture('player', SIZE, SIZE);
        g.destroy();
      }

      create() {
        this.add.tileSprite(WORLD / 2, WORLD / 2, WORLD, WORLD, 'floor');
        this.physics.world.setBounds(0, 0, WORLD, WORLD);

        this.player = this.physics.add
            .sprite(WORLD / 2, WORLD / 2, 'player')
            .setDrag(DRAG_COAST)          // 🆕 start with low drag
            .setMaxVelocity(MAX_SPEED)
            .setCollideWorldBounds(true);

        const cam = this.cameras.main;
        cam.setBounds(0, 0, WORLD, WORLD);
        cam.startFollow(this.player, true, 0.08, 0.08);
        cam.setDeadzone(cam.width * 0.4, cam.height * 0.4);

        this.cursors = this.input!.keyboard!.createCursorKeys();
        this.keyA = this.input!.keyboard!.addKey('A');
        this.keyD = this.input!.keyboard!.addKey('D');

        this.input!.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
          this.clickTarget = new Phaser.Math.Vector2(ptr.worldX, ptr.worldY);
          this.targetAngle = Phaser.Math.Angle.BetweenPoints(
            this.player,
            this.clickTarget,
          );
        });
      }

      update(_: number, dtMs: number) {
        const dt = dtMs / 1000;
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        const speed = body.velocity.length();

        /* dynamic turn cap */
        const t = Phaser.Math.Clamp(speed / MAX_SPEED, 0, 1);
        // const rotCap = Phaser.Math.Linear(ROT_TIGHT, ROT_WIDE, t);
        const rotCap = ROT_WIDE + (ROT_TIGHT - ROT_WIDE) * Math.pow(1 - t, 2);


        /* steer keys */
        const steer =
          (this.keyD.isDown || this.cursors.right.isDown ? 1 : 0) +
          (this.keyA.isDown || this.cursors.left.isDown ? -1 : 0);

        if (steer !== 0) {
          this.targetAngle = null;
          this.player.rotation += steer * rotCap * dt;
        } else if (this.targetAngle !== null) {
          this.player.rotation = Phaser.Math.Angle.RotateTo(
            this.player.rotation,
            this.targetAngle,
            rotCap * dt,
          );
          /* start moving once aligned */
          if (
            Phaser.Math.Within(
              Phaser.Math.Angle.ShortestBetween(
                Phaser.Math.RadToDeg(this.player.rotation),
                Phaser.Math.RadToDeg(this.targetAngle),
              ),
              0,
              2,
            )
          )
            this.moveTowardClick();
        }

        /* thrust keys ------------------------------------------------------------ */
        const forward  = this.cursors.up.isDown;
        const reverse  = this.cursors.down.isDown;

        if (forward || reverse) {
            this.player.setDrag(DRAG_ACTIVE);
            this.clickTarget = null;                         // cancel click nav

            const dir = forward ? 1 : -1;                    // 1 = forward, -1 = brake
            const accelMag = dir === 1 ? ACCEL : BRAKE_ACCEL;

            const vec = this.physics.velocityFromRotation(
                this.player.rotation,
                dir * accelMag,
            ) as Phaser.Math.Vector2;

            this.player.setAcceleration(vec.x, vec.y);
        
        } else {
            this.player.setDrag(DRAG_COAST);           // 🆕 gentle roll
            this.player.setAcceleration(0, 0);

            // extra slowdown while coasting & steering
            if (steer !== 0 && speed > 1e-3) {
                const slow = Math.max(0, 1 - TURN_SLOW * dt);
                body.setVelocity(body.velocity.x * slow, body.velocity.y * slow);
            }
        }

        /* lateral grip */
        if (speed > 1e-3) {
          const vel = new Phaser.Math.Vector2(body.velocity.x, body.velocity.y);
          const forward = new Phaser.Math.Vector2(
            Math.cos(this.player.rotation),
            Math.sin(this.player.rotation),
          );
          const long = forward.scale(vel.dot(forward));
          const lateral = vel.subtract(long).scale(Math.exp(-GRIP * dt));
          body.setVelocity(long.x + lateral.x, long.y + lateral.y);
        }

        /* arrival */
        if (this.clickTarget && Phaser.Math.Distance.BetweenPoints(this.player, this.clickTarget) < 16) {
          this.clickTarget = null;
          this.player.setAcceleration(0, 0);
          body.setVelocity(0, 0);
        }
      }

      private moveTowardClick() {
        if (this.clickTarget)
          this.physics.moveToObject(this.player, this.clickTarget, MAX_SPEED);
      }
    }

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: hostRef.current,
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 } } },
      scene: [MainScene],
      scale: { mode: Phaser.Scale.RESIZE },
      audio: { disableWebAudio: true },
    });

    const onResize = () =>
      gameRef.current?.scale.resize(window.innerWidth, window.innerHeight);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [onInteract]);

  return <div ref={hostRef} className="fixed inset-0" />;
}

