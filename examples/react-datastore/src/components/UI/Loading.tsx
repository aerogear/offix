import React from 'react';
import { Result, Spin } from 'antd';

export function Loading() {
  return (
    <Result
      icon={<Spin size="large" />}
      title="Loading..."
    />
  );
}