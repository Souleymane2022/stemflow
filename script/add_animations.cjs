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
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('client/src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content;

    if (newContent.includes('<Button')) {
        newContent = newContent.replace(/<Button(\s+[^>]*)className=(["']|{`)(.*?)(["']|`})/g, (match, prefix, quoteOpen, classes, quoteClose) => {
            if (classes.includes('interactive-element')) return match;
            return `<Button${prefix}className=${quoteOpen}interactive-element hover-elevate ${classes}${quoteClose}`;
        });

        newContent = newContent.replace(/<Button(\s+(?![^>]*className=)[^>]*)>/g, (match, attributes) => {
            if (attributes.endsWith('/')) {
                return `<Button className="interactive-element hover-elevate"${attributes.slice(0, -1)}/>`;
            }
            return `<Button className="interactive-element hover-elevate"${attributes}>`;
        });
    }

    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log('Updated ' + file);
    }
});
