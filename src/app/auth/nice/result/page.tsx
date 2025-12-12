import { Suspense } from 'react';
import NiceResultClient from './NiceResultClient';

export default function NiceResultPage() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Loading...</div>}>
      <NiceResultClient />
    </Suspense>
  );
}
