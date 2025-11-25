const fs = require('fs');
const filename = process.argv[2] || 'bins_output.json';
try {
  const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
  console.log(Object.keys(data));
} catch (e) {
  console.error("Error reading file:", e.message);
}
