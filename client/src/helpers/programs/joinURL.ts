export const joinURL = (base: string, path: string) => {
  const b = (base || '').replace(/\/+$/, '');
  const p = (path || '').replace(/^\/+/, '');
  return [b, p].filter(Boolean).join('/');
};