import React, { useEffect, useMemo, useRef } from "react";
import { CharacterActor } from "pixel-wizards-charachters/react";
import type { ActorRig, EmotionName, Gesture } from "pixel-wizards-charachters";

/**
 * ربو, the robot from pixel-wizards-charachters, used as the site's AI icon.
 * The rig blinks and breathes on its own; `mood` sets the face and `cue`
 * plays a one-shot gesture whenever its `key` changes. Reduced motion is
 * honoured by the library.
 */
export interface RobotCue {
  gesture: Gesture;
  key: number;
}

const AiRobot: React.FC<{
  size: number;
  mood?: EmotionName;
  cue?: RobotCue | null;
  className?: string;
}> = ({ size, mood = "happy", cue, className }) => {
  const rig = useRef<ActorRig | null>(null);
  const frame = useMemo(() => ({ emotion: mood, intensity: 0.8 }), [mood]);

  useEffect(() => {
    if (cue) rig.current?.playGesture(cue.gesture);
  }, [cue]);

  return (
    <span className={`ai-robot ${className ?? ""}`} aria-hidden="true">
      <CharacterActor character="robo" frame={frame} size={size} rigRef={rig} />
    </span>
  );
};

export default AiRobot;
