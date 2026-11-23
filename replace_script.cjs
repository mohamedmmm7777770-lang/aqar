const fs = require('fs');

const file = fs.readFileSync('./src/components/Listings.tsx', 'utf8');

const outputData = fs.readFileSync('output.json', 'utf8');

const regex = /const properties = \[[\s\S]*?\];\n\nconst containerVariants/m;

if (regex.test(file)) {
  const newFile = file.replace(regex, `const properties = ${outputData};\n\nconst containerVariants`);
  fs.writeFileSync('./src/components/Listings.tsx', newFile);
  console.log("Replaced successfully!");
} else {
  console.log("Could not find the target string.");
}
