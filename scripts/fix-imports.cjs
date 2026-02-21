const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../components');
const pagesDir = path.join(__dirname, '../pages');
const baseDir = path.join(__dirname, '..');
const iconsDir = path.join(componentsDir, 'icons');

// Read existing index.tsx to get the list of exported icons
const indexTsxPath = path.join(iconsDir, 'index.tsx');
const indexContent = fs.readFileSync(indexTsxPath, 'utf8');
const iconNamesMatch = indexContent.match(/export const ([A-Z][a-zA-Z0-9]*Icon)/g);
const iconNames = iconNamesMatch ? iconNamesMatch.map(m => m.split(' ')[2]) : [];

console.log(`Found ${iconNames.length} icons in index.tsx`);

// Update imports
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

            for (const icon of iconNames) {
                const regexes = [
                    { re: new RegExp(`import\\s+${icon}\\s+from\\s+['"]\\.\\/${icon}['"];?`, 'g'), rep: `import { ${icon} } from './icons';` },
                    { re: new RegExp(`import\\s+${icon}\\s+from\\s+['"]\\.\\/components\\/${icon}['"];?`, 'g'), rep: `import { ${icon} } from './components/icons';` },
                    { re: new RegExp(`import\\s+${icon}\\s+from\\s+['"]\\.\\.\\/components\\/${icon}['"];?`, 'g'), rep: `import { ${icon} } from '../components/icons';` },
                    { re: new RegExp(`import\\s+${icon}\\s+from\\s+['"]\\.\\.\\/\\.\\.\\/components\\/${icon}['"];?`, 'g'), rep: `import { ${icon} } from '../../components/icons';` },
                    // New regexes for admin directory:
                    { re: new RegExp(`import\\s+${icon}\\s+from\\s+['"]\\.\\.\\/\\.\\.\\/${icon}['"];?`, 'g'), rep: `import { ${icon} } from '../../icons';` },
                    { re: new RegExp(`import\\s+${icon}\\s+from\\s+['"]\\.\\.\\/${icon}['"];?`, 'g'), rep: `import { ${icon} } from '../icons';` },
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
updateImportsInDir(baseDir);

console.log('Import paths fix completed.');
