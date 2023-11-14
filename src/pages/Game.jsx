import { Debug, useContactMaterial } from "@react-three/cannon";
import Player from "../components/threejs/Player";
import Obstacles from "../components/threejs/Obstacles";
import Floor from "../components/threejs/Floor";
import { useControls } from "leva";

function ToggleDebug({ children }) {
  const debugRendererVisible = useControls("Debug Renderer", {
    visible: false,
  });

  return (
    <>
      {debugRendererVisible.visible ? (
        <Debug color={0x008800}>{children}</Debug>
      ) : (
        <>{children}</>
      )}
    </>
  );
}

export default function Game() {
  useContactMaterial("ground", "slippery", {
    friction: 0,
    restitution: 0.3,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
  });

  return (
    <>
      <ToggleDebug>
        <Floor />
        {/* <Obstacles /> */}
        <Player position={[0, 1, 0]} />
      </ToggleDebug>
    </>
  );
}
