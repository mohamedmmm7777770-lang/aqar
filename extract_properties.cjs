const fs = require('fs');

const file = fs.readFileSync('src/components/Listings.tsx', 'utf8');
const regex = /const properties = (\[[\s\S]*?\]);\n\nconst containerVariants/m;

const match = file.match(regex);
if (match) {
  const propertiesData = match[1];
  fs.writeFileSync('src/data/properties.ts', `export const properties = ${propertiesData};\n`);
  
  const newFile = file.replace(regex, `import { properties } from "../data/properties";\n\nconst containerVariants`);
  fs.writeFileSync('src/components/Listings.tsx', newFile);
  console.log("Successfully extracted properties to src/data/properties.ts");
} else {
  console.log("Could not find properties array.");
}
