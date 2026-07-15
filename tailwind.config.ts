import type { Config } from 'tailwindcss';
const config: Config = { content: ['./src/**/*.{ts,tsx}'], theme: { extend: { colors: { ocean: 'var(--color-ocean)', sea: 'var(--color-sea)', surface: 'var(--color-surface)', charcoal: 'var(--color-charcoal)' }, boxShadow: { soft: '0 20px 60px rgba(10, 37, 64, .08)' } } }, plugins: [] };
export default config;
