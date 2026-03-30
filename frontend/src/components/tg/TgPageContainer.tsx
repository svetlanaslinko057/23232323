'use client';

import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 16px;
  padding-bottom: 100px;
  min-height: 100%;
  overflow-y: auto;
`;

interface TgPageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function TgPageContainer({ children, className }: TgPageContainerProps) {
  return (
    <Container className={className} data-testid="tg-page-container">
      {children}
    </Container>
  );
}

export default TgPageContainer;
