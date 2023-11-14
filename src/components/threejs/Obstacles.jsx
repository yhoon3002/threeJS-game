import { useEffect, useRef } from "react";
import { useCompoundBody } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";

const positions = [
  [-5, 1, -5],
  [-5, 1, 0],
  [-5, 1, 5],
  [0, 1, -5],
  [0, 1, 5],
  [5, 1, -5],
  [5, 1, 0],
  [5, 1, 5],
];

function Obstacle({ position }) {
  const [ref, api] = useCompoundBody(
    () => ({
      mass: 1,
      position: position,
      shapes: [
        { args: [0.4], position: [1.75, 0, 0], type: "Sphere" },
        { args: [0.4], position: [1.05, 0, 0], type: "Sphere" },
        { args: [0.75], position: [0, 0, 0], type: "Sphere" },
        { args: [0.4], position: [-1.05, 0, 0], type: "Sphere" },
        { args: [0.4], position: [-1.75, 0, 0], type: "Sphere" },
      ],
    }),
    useRef()
  );

  useEffect(() => {
    api.angularFactor.set(0, 1, 0);
  });

  useFrame((_, delta) => {
    api.angularVelocity.set(0, 50 * delta, 0);
  });

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <cylinderGeometry args={[0.25, 0.25, 1.5]} />
      <meshStandardMaterial />
      <mesh rotation={[0, 0, -Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.25, 4]} />
        <meshStandardMaterial />
      </mesh>
    </mesh>
  );
}

export default function Obstacles() {
  return (
    <>
      {positions.map((position, i) => (
        <Obstacle key={i} position={position} material={"ground"} />
      ))}
    </>
  );
}
