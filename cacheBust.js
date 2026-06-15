const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../frontend/pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace .js" with .js?v=2" for data, main, and specific scripts
    content = content.replace(/src="\.\.\/js\/data\.js"/g, 'src="../js/data.js?v=2"');
    content = content.replace(/src="\.\.\/js\/main\.js"/g, 'src="../js/main.js?v=2"');
    content = content.replace(/src="\.\.\/js\/([^."]+)\.js"/g, 'src="../js/$1.js?v=2"');
    
    fs.writeFileSync(filePath, content);
});

console.log('Cache busters added to pages.');
