import React, { useEffect, useMemo, useRef, useState } from "react";
import { CharacterActor } from "pixel-wizards-charachters/react";
import type { ActorRig, EmotionName, Facing, Gesture, Locomotion } from "pixel-wizards-charachters";

/**
 * ربو, the robot from pixel-wizards-charachters, used as the site's AI icon.
 * The rig blinks and breathes on its own; the props below are its frame, and
 * `cue` plays a one-shot gesture whenever its `key` changes. Reduced motion is
 * honoured by the library.
 */
export interface RobotCue {
  gesture: Gesture;
  key: number;
}

export type RobotMood = EmotionName;

const AiRobot: React.FC<{
  size: number;
  mood?: EmotionName;
  cue?: RobotCue | null;
  locomotion?: Locomotion;
  facing?: Facing;
  gaze?: { x: number; y: number };
  className?: string;
}> = ({ size, mood = "happy", cue, locomotion = "idle", facing = "right", gaze, className }) => {
  const rig = useRef<ActorRig | null>(null);
  const gx = gaze?.x ?? 0;
  const gy = gaze?.y ?? 0;
  const frame = useMemo(
    () => ({ emotion: mood, intensity: 0.8, locomotion, facing, gaze: { x: gx, y: gy } }),
    [mood, locomotion, facing, gx, gy],
  );

  useEffect(() => {
    if (cue) rig.current?.playGesture(cue.gesture);
  }, [cue]);

  return (
    <span className={`ai-robot ${className ?? ""}`} aria-hidden="true">
      <CharacterActor character="robo" frame={frame} size={size} rigRef={rig} />
    </span>
  );
};

/** True while `query` matches; follows changes such as rotating a phone. */
export const useMedia = (query: string) => {
  const get = () => typeof window !== "undefined" && Boolean(window.matchMedia?.(query).matches);
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    const list = window.matchMedia?.(query);
    if (!list) return;
    const onChange = () => setMatches(list.matches);
    onChange();
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [query]);
  return matches;
};

export default AiRobot;
