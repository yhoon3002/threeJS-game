import { useFBX } from "@react-three/drei";
import { useRef, useEffect } from "react";
import { useStore } from "../../App";

const Soldier = () => {
  const ref = useRef();
  const soldierModel = useFBX("/Character.fbx");
  const basicAnimation = useFBX("/BasicStanding.fbx");
  const walkingAnimation = useFBX("/Walking.fbx");
  const jumpingAnimation = useFBX("/Jumping.fbx");
  const dyingAnimation = useFBX("/Dying.fbx");

  const { actions, mixer } = useStore((state) => state);

  useEffect(() => {
    actions["basic"] = mixer.clipAction(
      basicAnimation.animations[0],
      ref.current
    );
    actions["dying"] = mixer.clipAction(
      dyingAnimation.animations[0],
      ref.current
    );
    actions["walking"] = mixer.clipAction(
      walkingAnimation.animations[0],
      ref.current
    );
    actions["jumping"] = mixer.clipAction(
      jumpingAnimation.animations[0],
      ref.current
    );

    actions["basic"].play();
  }, [
    mixer,
    actions,
    basicAnimation,
    walkingAnimation,
    jumpingAnimation,
    dyingAnimation,
  ]);

  return (
    <group ref={ref} dispose={null}>
      <group name="Scene">
        <group name="Armature" scale={0.008}>
          <primitive
            object={soldierModel}
            // ref={ref}
            // dispose={null}
            // scale={0.008}
          />
        </group>
      </group>
    </group>
  );
};

export default Soldier;
