// Copy the ffl-emscripten.cjs to public as an ESM-compatible file
// by wrapping it with a minimal shim

import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

export default function fflEmscriptenPlugin() {
  return {
    name: 'ffl-emscripten-shim',
    configResolved(config) {
      // Copy CJS file to public with ESM wrapper
      const cjsPath = resolve(__dirname, 'node_modules/.pnpm/ffl.js@https+++codeload.github.com+ariankordi+FFL.js+tar.gz+3a1236753eba69c9260bfc46f84_36b10cd016d68063cf54488b7ebbd611/node_modules/ffl.js/ffl-emscripten.cjs')
      const publicDir = resolve(__dirname, 'public')
      
      const cjsSource = readFileSync(cjsPath, 'utf-8')
      
      const esmSource = `// Auto-generated ESM wrapper for ffl-emscripten.cjs
// Source: ffl.js package
const __module = { exports: {} };
const __exports = __module.exports;
${cjsSource
  .replace(/^var ModuleFFL/, 'var ModuleFFL')
  .replace(/if \(typeof exports === 'object' && typeof module === 'object'\)[\s\S]*?else if \(typeof define[\s\S]*$/, '')
}
export default __module.exports;
export const { default: ModuleFFL } = __module.exports;
`
      
      writeFileSync(resolve(publicDir, 'ffl-emscripten-esm.js'), esmSource)
    }
  }
}
