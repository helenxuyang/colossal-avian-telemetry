import styled from "styled-components";
import { Container, SMALL_VIEWPORT, Value } from "./styles";
import { getClampedPercent, DEFAULT_COLOR } from "./dataUtils";

const StyledContainer = styled(Container)`
  @media (max-width: ${SMALL_VIEWPORT}px) {
    width: auto;
  }
`;

const BarDisplay = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const BarHolder = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 25px;
  background-color: white;
  margin: 8px;
`;

const Bar = styled.div<{ $percent: number; $color: string }>`
  position: absolute;
  background-color: ${({ $color }) => `${$color}`};
  height: 100%;
  width: ${({ $percent }) => `${$percent}%`};
`;

const RangeText = styled.p`
  font-size: 12px;
`;

type Props = {
  name: string;
  value: number;
  min: number;
  max: number;
  className?: string;
};

export const HorizontalBarDisplay = ({
  name,
  value,
  min,
  max,
  className = "",
}: Props) => {
  const percent = getClampedPercent(value, min, max);
  const barColor = DEFAULT_COLOR;

  return (
    <StyledContainer className={className}>
      <h4>{name}</h4>
      <BarDisplay>
        <RangeText>{min}</RangeText>
        <BarHolder>
          <Bar $percent={percent} $color={barColor} />
        </BarHolder>
        <RangeText>{max}</RangeText>
      </BarDisplay>
      <Value>{value}</Value>
    </StyledContainer>
  );
};
