import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 40px rgba(56, 189, 248, 0.25)'
      },
      backgroundImage: {
        'hero-grid': 'radial-gradient(circle at top, rgba(56,189,248,0.18), transparent 36%), linear-gradient(135deg, rgba(10,14,28,1), rgba(7,10,20,1) 48%, rgba(17,24,39,1))'
      },
      colors: {
        ink: {
          950: '#040814',
          900: '#09101f'
        }
      }
    }
  },
  plugins: []
};

export default config;
