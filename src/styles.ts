import styled from "styled-components";

export const MEDIUM_VIEWPORT = 800;
export const SMALL_VIEWPORT = 600;

export const BACKGROUND = "#444";

export const Container = styled.div`
  background-color: ${BACKGROUND};
  padding: 8px;
  color: white;
`;

export const Value = styled.p`
  font-weight: bold;
  font-size: 24px;
  line-height: normal;
  @media (max-width: ${MEDIUM_VIEWPORT}px) {
    font-size: 18px;
  }
`;
