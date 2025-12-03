const fs = require('fs');
const path = require('path');

// כאן תציין את התיקייה הראשית של הפרויקט שלך
const SRC_DIR = path.join(__dirname, 'src');

// פונקציה שמחליפה סיומת קובץ מ-.json ל-.jsx
function renameJsonToJsx(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  items.forEach(item => {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      renameJsonToJsx(fullPath);
    } else if (item.isFile() && path.extname(item.name).toLowerCase() === '.json') {
      const newName = path.basename(item.name, '.json') + '.jsx';
      const newPath = path.join(dir, newName);

      fs.renameSync(fullPath, newPath);
      console.log(`✅ ${fullPath} → ${newPath}`);
    }
  });
}

renameJsonToJsx(SRC_DIR);

console.log('🎉 כל הקבצים שונו ל-JSX!');
