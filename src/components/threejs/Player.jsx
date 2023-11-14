import { useRef, useMemo, Suspense } from "react";
import { useCompoundBody } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import Soldier from "./Soldier";
import useFollowCam from "./useFollowCam";
import useKeyboard from "./useKeyboard";
import { Vector3, Euler, Quaternion, Matrix4 } from "three";
import { Vec3 } from "cannon-es";
import { useStore } from "../../App";

export default function Player({ position }) {
  const playerGrounded = useRef(false);
  const inJumpAction = useRef(false);
  const group = useRef();
  const { yaw } = useFollowCam(group, [0, 1, 2]);
  const velocity = useMemo(() => new Vector3(), []);
  const inputVelocity = useMemo(() => new Vector3(), []);
  const euler = useMemo(() => new Euler(), []);
  const quat = useMemo(() => new Quaternion(), []);
  const targetQuaternion = useMemo(() => new Quaternion(), []);
  const worldPosition = useMemo(() => new Vector3(), []);
  const raycasterOffset = useMemo(() => new Vector3(), []);
  const contactNormal = useMemo(() => new Vec3(0, 0, 0), []);
  const down = useMemo(() => new Vec3(0, -1, 0), []);
  const rotationMatrix = useMemo(() => new Matrix4(), []);
  const prevActiveAction = useRef(0);
  const keyboard = useKeyboard();

  const { groundObjects, actions, mixer, setTime, setFinished } = useStore(
    (state) => state
  );

  const [ref, body] = useCompoundBody(
    () => ({
      mass: 1,
      shapes: [
        { args: [0.35], position: [0.03, 0.35, 0], type: "Sphere" },
        { args: [0.3], position: [0.03, 0.95, 0], type: "Sphere" },
        { args: [0.1], position: [0.03, 1.35, 0.03], type: "Sphere" },
      ],
      onCollide: (e) => {
        if (e.contact.bi.id !== e.body.id) {
          contactNormal.set(...e.contact.ni);
        }
        if (contactNormal.dot(down) > 0.5) {
          if (inJumpAction.current) {
            // landed
            inJumpAction.current = false;
            actions["jumping"].fadeOut(0.1);
          }
        }
      },
      material: "slippery",
      linearDamping: 0,
      position: position,
    }),
    useRef()
  );

  useFrame(({ raycaster }, delta) => {
    let activeAction = 0; // 0:idle, 1:walking, 2:jumping
    body.angularFactor.set(0, 0, 0);

    ref.current.getWorldPosition(worldPosition);

    playerGrounded.current = false;
    raycasterOffset.copy(worldPosition);
    raycasterOffset.y += 0.01;
    raycaster.set(raycasterOffset, down);
    raycaster
      .intersectObjects(Object.values(groundObjects), false)
      .forEach((i) => {
        if (i.distance < 0.028) {
          playerGrounded.current = true;
        }
      });
    if (!playerGrounded.current) {
      body.linearDamping.set(0);
    } else {
      body.linearDamping.set(0.9999999);
    }

    const distance = worldPosition.distanceTo(group.current.position);

    rotationMatrix.lookAt(
      worldPosition,
      group.current.position,
      group.current.up
    );
    targetQuaternion.setFromRotationMatrix(rotationMatrix);
    if (
      distance > 0.0001 &&
      !group.current.quaternion.equals(targetQuaternion)
    ) {
      targetQuaternion.z = 0;
      targetQuaternion.x = 0;
      targetQuaternion.normalize();
      group.current.quaternion.rotateTowards(targetQuaternion, delta * 3);
    }
    if (document.pointerLockElement) {
      inputVelocity.set(0, 0, 0);
      if (playerGrounded.current) {
        // if grounded I can walk
        if (keyboard["KeyW"]) {
          activeAction = 1;
          inputVelocity.z = -40 * delta;
        }
        if (keyboard["KeyS"]) {
          activeAction = 1;
          inputVelocity.z = 40 * delta;
        }
        if (keyboard["KeyA"]) {
          activeAction = 1;
          inputVelocity.x = -40 * delta;
        }
        if (keyboard["KeyD"]) {
          activeAction = 1;
          inputVelocity.x = 40 * delta;
        }
      }
      inputVelocity.setLength(0.6);

      if (activeAction !== prevActiveAction.current) {
        if (prevActiveAction.current !== 1 && activeAction === 1) {
          actions["walking"].reset().fadeIn(0.0001).play();
          actions["basic"].stop().fadeOut(0.0001);
        }
        if (prevActiveAction.current !== 0 && activeAction === 0) {
          actions["basic"].reset().fadeIn(0.1).play();
          actions["walking"].stop().fadeOut(0.1);
        }
        prevActiveAction.current = activeAction;
      }

      if (keyboard["Space"]) {
        if (playerGrounded.current && !inJumpAction.current) {
          activeAction = 2;
          inJumpAction.current = true;
          actions["jumping"].reset().fadeIn(0.1).play();
          inputVelocity.y = 8;
        }
      }

      euler.y = yaw.rotation.y;
      euler.order = "YZX";
      quat.setFromEuler(euler);
      inputVelocity.applyQuaternion(quat);
      velocity.set(inputVelocity.x, inputVelocity.y, inputVelocity.z);

      body.applyImpulse([velocity.x, velocity.y, velocity.z], [0, 0, 0]);
    }

    if (activeAction === 1) {
      mixer.update(delta * distance * 22.5);
    } else {
      mixer.update(delta);
    }

    if (worldPosition.y < -3) {
      body.velocity.set(0, 0, 0);
      body.position.set(0, 1, 0);
      // body.position.copy(position);
      group.current.position.set(0, 1, 0);
      setFinished(false);
      setTime(0);
    }

    // group.current.position.lerp(worldPosition, 0.3);
    group.current.position.copy(worldPosition);
  });

  return (
    <>
      <group ref={group} position={position}>
        <Suspense fallback={null}>
          <Soldier />
        </Suspense>
      </group>
    </>
  );
}
