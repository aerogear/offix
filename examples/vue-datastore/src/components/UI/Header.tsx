import React from 'react';
import { PageHeader } from 'antd';

export function Header({ title, onBack, extra, children } : any, props : any) {
  return (
    <PageHeader
      title={title}
      onBack={onBack}
      extra={extra}
      {...props}
    >
      { children }
    </PageHeader>
  );
}
