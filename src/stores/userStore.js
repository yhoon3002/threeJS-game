import { atom } from "recoil";
import { AnimationMixer } from "three";

export const groundObjects = atom({
  key: "groundObjects",
  default: {},
});

export const animation = atom({
  key: "animation",
  default: {},
});

export const mixer = atom({
  key: "mixer",
  default: new AnimationMixer(),
});

export const finished = atom({
  key: "finished",
  default: "",
});
