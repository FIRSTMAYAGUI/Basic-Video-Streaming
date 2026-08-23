import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from 'fs'
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World! yo');
});

const Filename = fileURLToPath(import.meta.url); // 2. Get current file path
const Dirname = path.dirname(Filename);  // 3. Get directory path
//console.log("filename: ", Filename, "and dirname: ", Dirname);

app.get('/video', (req, res) => {
  const range = req.headers.range;
  const videoPath = path.join(Dirname, "videos", "The_FULL_2024_NBA_SlamDunk_Contest!.mp4");

  if (!range) {
    console.log('No range');

    //console.log('the video path is: ',videoPath)
    return res.status(200).send(videoPath);
  }

  const videoSize = fs.statSync(videoPath).size;
  console.log('the range is: ', range);
  const rangeExtraction = range?.replace('bytes=', '').split('-')
  console.log(rangeExtraction);

  const start = parseInt(rangeExtraction?.[0]);
  const end = rangeExtraction?.[1] ? parseInt(rangeExtraction?.[1]) : videoSize-1;

  const contentLength = end - start + 1;
  
  console.log('the video size is: ', videoSize);
  console.log('content length: ', contentLength);
  console.log('the start is: ',  start, 'and the end is: ', end);

  res.status(206).set({
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': 'video/mp4',
  });

  const videoStream = fs.createReadStream(videoPath, {start, end});
  videoStream.pipe(res);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});