const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('client/src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('<Card ')) {
        const newContent = content.replace(/<Card(\s+[^>]*)className=(["']|{`)(.*?)(["']|`})/g, (match, prefix, quoteOpen, classes, quoteClose) => {
            if (classes.includes('glass-panel')) return match;
            return `<Card${prefix}className=${quoteOpen}glass-panel premium-shadow border-0 ${classes}${quoteClose}`;
        });
        if (content !== newContent) {
            fs.writeFileSync(file, newContent, 'utf8');
            console.log('Updated ' + file);
        }
    }
});
