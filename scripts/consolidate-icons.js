const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../components');
const pagesDir = path.join(__dirname, '../pages');
const iconsDir = path.join(componentsDir, 'icons');
const baseDir = path.join(__dirname, '..');

if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. Find all *Icon.tsx files in components/
const files = fs.readdirSync(componentsDir);
const iconFiles = files.filter(f => f.endsWith('Icon.tsx'));

let combinedIconsCode = `import React from 'react';\n\n`;
let iconNames = [];

for (const file of iconFiles) {
    const iconName = file.replace('.tsx', '');
    iconNames.push(iconName);
    const filePath = path.join(componentsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove React imports
    content = content.replace(/import\s+React.*?from\s+['"]react['"];?/g, '');

    // Add export to const definitions
    content = content.replace(new RegExp(`const\\s+${iconName}\\s*(=|:)`, 'g'), `export const ${iconName} $1`);

    // Remove export default
    content = content.replace(new RegExp(`export\\s+default\\s+${iconName};?`, 'g'), '');

    // Clean up empty lines created by removals
    content = content.replace(/^\s*[\r\n]/gm, '');

    combinedIconsCode += `// --- ${iconName} ---\n`;
    combinedIconsCode += content + '\n\n';
}

// 2. Write the new index.tsx
const indexTsxPath = path.join(iconsDir, 'index.tsx');
fs.writeFileSync(indexTsxPath, combinedIconsCode);
console.log(`Created ${indexTsxPath} with ${iconNames.length} icons.`);

// 3. Update imports in all .tsx and .ts files
function updateImportsInDir(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'icons') continue;
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            updateImportsInDir(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Simple search and replace for each icon
            for (const icon of iconNames) {
                // Look for patterns like: import TrashIcon from './TrashIcon';
                // or import TrashIcon from '../components/TrashIcon';

                const regexes = [
                    { re: new RegExp(`import\\s+${icon}\\s+from\\s+['"]\\.\\/${icon}['"];?`, 'g'), rep: `import { ${icon} } from './icons';` },
                    { re: new RegExp(`import\\s+${icon}\\s+from\\s+['"]\\.\\/components\\/${icon}['"];?`, 'g'), rep: `import { ${icon} } from './components/icons';` },
                    { re: new RegExp(`import\\s+${icon}\\s+from\\s+['"]\\.\\.\\/components\\/${icon}['"];?`, 'g'), rep: `import { ${icon} } from '../components/icons';` },
                ];

                for (const { re, rep } of regexes) {
                    if (re.test(content)) {
                        content = content.replace(re, rep);
                        modified = true;
                    }
                }
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated imports in ${fullPath}`);
            }
        }
    }
}

updateImportsInDir(componentsDir);
updateImportsInDir(pagesDir);
updateImportsInDir(baseDir); // for App.tsx etc. if applicable

// 4. Delete old icon files
for (const file of iconFiles) {
    fs.unlinkSync(path.join(componentsDir, file));
    console.log(`Deleted ${file}`);
}

console.log('Icon consolidation completed successfully.');
