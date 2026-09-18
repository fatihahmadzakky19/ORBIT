const fs = require('fs');
const path = require('path');

// 1. Analyze Chunks
const chunksDir = path.join('.next', 'static', 'chunks');
if (fs.existsSync(chunksDir)) {
  const getFiles = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const full = path.join(dir, file);
      const stat = fs.statSync(full);
      if (stat && stat.isDirectory()) {
        results = results.concat(getFiles(full));
      } else {
        results.push({ path: full, size: stat.size, name: file });
      }
    });
    return results;
  };

  const files = getFiles(chunksDir).sort((a, b) => b.size - a.size);
  console.log('=== TOP 15 CHUNKS ===');
  files.slice(0, 15).forEach(f => {
    console.log(`${(f.size / 1024).toFixed(2)} KB - ${f.name}`);
    if (f.name.endsWith('.js') && f.size > 50000) {
      try {
        const content = fs.readFileSync(f.path, 'utf8');
        const keywords = ['three', 'react-three', 'framer-motion', 'lucide', 'date-fns', 'zod', 'prisma', 'postprocessing'];
        const found = keywords.filter(k => content.toLowerCase().includes(k));
        console.log(`   -> contains keywords: ${found.join(', ')}`);
      } catch (e) {}
    }
  });
}

// 2. Analyze Public Images
const publicDir = 'public';
if (fs.existsSync(publicDir)) {
  const getImages = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const full = path.join(dir, file);
      const stat = fs.statSync(full);
      if (stat && stat.isDirectory()) {
        results = results.concat(getImages(full));
      } else {
        results.push({ path: full, size: stat.size, name: file });
      }
    });
    return results;
  };
  const images = getImages(publicDir).sort((a, b) => b.size - a.size);
  console.log('\n=== PUBLIC IMAGES ===');
  images.forEach(img => {
    console.log(`${(img.size / 1024).toFixed(2)} KB - ${img.path}`);
  });
}
