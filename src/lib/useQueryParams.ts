import { useEffect, useState } from 'react';

export function useQueryParams(): URLSearchParams {
  const [params, setParams] = useState<URLSearchParams>(() => parse());
  useEffect(() => {
    const onHash = () => setParams(parse());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return params;
}

function parse(): URLSearchParams {
  const hash = window.location.hash.replace(/^#/, '');
  const idx = hash.indexOf('?');
  return new URLSearchParams(idx >= 0 ? hash.slice(idx + 1) : '');
}
