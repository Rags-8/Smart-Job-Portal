const fs = require('fs');
const path = require('path');

const directory = './src';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(directory);

let totalReplaced = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Replace indigo with sky (bright blue) for most interactive elements
    const regex = /(bg-|text-|border-|ring-|from-|to-|focus:ring-|shadow-|hover:bg-|hover:border-|hover:shadow-|hover:text-)(indigo)(-([0-9]{2,3}(?:\/[0-9]{2})?))?/g;

    const newContent = content.replace(regex, (match, prefix, color, suffixKey, shade) => {
        const suffix = suffixKey || '';
        return `${prefix}sky${suffix}`;
    });

    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Updated ${file}`);
        totalReplaced++;
    }
});

console.log(`\nReplacement complete. Updated ${totalReplaced} files from indigo to sky.`);
