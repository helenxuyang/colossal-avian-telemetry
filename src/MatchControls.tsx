import { useRef, useState } from "react";
import { ButtonsHolder } from "./styles";
import styled from "styled-components";

type FightStatus = "INACTIVE" | "FIGHTING" | "PAUSED";

const MatchControlsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MATCH_LENGTH = 180;

type Props = {
  onStart: () => void;
};
export const MatchControls = ({ onStart }: Props) => {
  const [fightStatus, setFightStatus] = useState<FightStatus>("INACTIVE");
  const [matchTimeSec, setMatchTimeSec] = useState<number>(MATCH_LENGTH);
  const timerRef = useRef<number>(null);

  const min = Math.floor(matchTimeSec / 60);
  const sec = matchTimeSec % 60;
  const time = `${min}:${sec < 10 ? "0" : ""}${sec}`;

  const setTimer = () => {
    timerRef.current = setInterval(() => {
      setMatchTimeSec((sec) => sec - 1);
    }, 1000);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
  const handleStart = () => {
    setFightStatus("FIGHTING");
    setTimer();
    onStart();
  };

  const handlePause = () => {
    setFightStatus("PAUSED");
    clearTimer();
  };

  const handleEnd = () => {
    setFightStatus("INACTIVE");
    clearTimer();
    setMatchTimeSec(MATCH_LENGTH);
  };

  const startButton = <button onClick={handleStart}>▶</button>;
  const pauseButton = <button onClick={handlePause}>⏸</button>;
  const endButton = <button onClick={handleEnd}>⏹</button>;

  const getButtons = () => {
    switch (fightStatus) {
      case "INACTIVE":
        return startButton;
      case "FIGHTING":
        return (
          <ButtonsHolder>
            {pauseButton}
            {endButton}
          </ButtonsHolder>
        );
      case "PAUSED":
        return (
          <ButtonsHolder>
            {startButton}
            {endButton}
          </ButtonsHolder>
        );
    }
  };

  return (
    <MatchControlsSection>
      <strong>Time left:</strong> <span>{time}</span>
      {getButtons()}
    </MatchControlsSection>
  );
};
