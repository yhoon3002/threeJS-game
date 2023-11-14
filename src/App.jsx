import { Suspense } from "react";
import { RecoilRoot } from "recoil";
import { Physics } from "@react-three/cannon";
import { Html, Stats, useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { create } from "zustand";
import { AnimationMixer } from "three";
import Game from "./pages/Game";

export const useStore = create(() => ({
  groundObjects: {},
  actions: {},
  mixer: new AnimationMixer(),
}));

function App() {
  function Loader() {
    const { progress } = useProgress();
    return <Html center>{progress} % loaded</Html>;
  }

  return (
    <>
      <RecoilRoot>
        <div style={{ width: "100vw", height: "100vh" }}>
          <Canvas shadows onPointerDown={(e) => e.target.requestPointerLock()}>
            <Suspense fallback={<Loader />}>
              <spotLight
                position={[2.5, 5, 5]}
                angle={Math.PI / 3}
                penumbra={0.5}
                castShadow
                shadow-mapSize-height={2048}
                shadow-mapSize-width={2048}
                intensity={Math.PI * 25}
              />
              <spotLight
                position={[-2.5, 5, 5]}
                angle={Math.PI / 3}
                penumbra={0.5}
                castShadow
                shadow-mapSize-height={2048}
                shadow-mapSize-width={2048}
                intensity={Math.PI * 25}
              />
              <Physics>
                <Game />
              </Physics>
              <gridHelper />
              <Stats />
            </Suspense>
          </Canvas>
        </div>
      </RecoilRoot>
    </>
  );
}

export default App;
