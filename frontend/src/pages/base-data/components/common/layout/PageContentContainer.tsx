import React from 'react';

export interface PageContentContainerProps {
  children: React.ReactNode;
}

const PageContentContainer: React.FC<PageContentContainerProps> = ({
  children,
}) => {
  return (
    <div
      style={{
        padding: '8px',
        minHeight: '600px',
        width: '100%',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export { PageContentContainer };
