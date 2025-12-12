import { Suspense } from 'react';
import NiceBlogCertifyClient from './NiceBlogCertifyClient';

export default function Certify() {
  return (
    <Suspense
      fallback={<div className="mx-auto max-w-xl px-4 py-10">Loading…</div>}
    >
      <NiceBlogCertifyClient />
    </Suspense>
  );
}


