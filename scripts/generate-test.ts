import fs from 'fs';

const module = process.argv[2];
const type = process.argv[3];

const path = `test/${type}/${module}/${module}.spec.ts`;
fs.mkdirSync(`test/${type}/${module}`, { recursive: true });
fs.writeFileSync(
  path,
  `
    
    `,
);
