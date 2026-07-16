declare module '@netlify/blobs' { export function getStore(name: string): { get(key: string): Promise<string | null>; set(key: string, value: string): Promise<void> } }
