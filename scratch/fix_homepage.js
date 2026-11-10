const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/HomePage.tsx', 'utf-8');
code = code.replace('onSearch={(query) => {', 'onSearch={(query: string) => {');
code = code.replace('onTabChange={(tab) => {', 'onTabChange={(tab: any) => {');
fs.writeFileSync('frontend/src/pages/HomePage.tsx', code, 'utf-8');
console.log('Successfully updated HomePage.tsx');
