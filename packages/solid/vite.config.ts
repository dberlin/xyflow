import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    solidPlugin(),
    dts({
      rollupTypes: true,
    }),
  ],
  build: {
    target: 'esnext',
    // Temporary for debugging
    minify: false,
    sourcemap: true,
    lib: {
      entry: 'src/lib/index.ts',
      formats: ['es', 'umd', 'cjs'],
      name: '@xyflow/solid',
      fileName: 'index',
    },
    rollupOptions: {
      external: ['solid-js', 'react'],
      output: {
        globals: {
          'solid-js': 'SolidJS',
          react: 'React',
        },
      },
    },
  },
});
