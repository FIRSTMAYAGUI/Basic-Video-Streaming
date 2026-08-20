import fs from 'fs'


/* fs.stat('./videos/COTE_S1_EP1_VF_Extract.mp4', (err, stats) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  stats.isFile(); // true
  stats.isDirectory(); // false
  stats.isSymbolicLink(); // false
  console.log(stats.size); // 1024000 //= 1MB
  console.log(stats.isFile()); // 1024000 //= 1MB
  console.log(stats.isDirectory()); // 1024000 //= 1MB
  console.log(stats.isSymbolicLink()); // 1024000 //= 1MB
}); */

const stats = fs.statSync('./videos/COTE_S1_EP1_VF_Extract.mp4');
try {
  const stats = fs.statSync('./videos/COTE_S1_EP1_VF_Extract.mp4');
} catch (err) {
  console.error("The Error:", err);
}

console.log(stats.size)