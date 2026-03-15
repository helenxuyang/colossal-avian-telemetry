import styled from "styled-components";
import { pulseAnimation } from "./styles";

const StyledDot = styled.span`
  ${pulseAnimation}
`;

export const StatusDot = () => {
  return <StyledDot>🔴</StyledDot>;
};
