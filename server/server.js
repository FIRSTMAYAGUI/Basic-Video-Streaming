import express from "express";
import { fstat } from "fs";
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
  const BrowserHeaders = req.headers;
  //console.log("This is a browser header: ", BrowserHeaders);
  // 1. Check for the Range header
  const range = req.headers.range;
  const videoPath = path.join(Dirname, "videos", "COTE_S1_EP1_VF_Extract.mp4");

  if (!range) {
    console.log('No range');
    // ----------------------------------------------------
    // PATH 1: No Range header (Fallback)
    // ----------------------------------------------------
    // The client just wants the whole file at once.
    // Send standard 200 OK with res.sendFile() or pipe full stream

    //console.log('the video path is: ',videoPath)
    res.status(200).sendFile(videoPath);

  }

  const videoStat = fs.statSync(videoPath);
  console.log('the range is: ', range);
  const rangeExtraction = range?.replace('bytes=', '').split('-')
  console.log(rangeExtraction);

  const start = parseInt(rangeExtraction?.[0]);
  const end = rangeExtraction?.[1] ? parseInt(rangeExtraction?.[1]) : videoStat.size;

  
  console.log('the video size is: ', videoStat.size);
  console.log('the start is: ', typeof start, 'and the end is: ',typeof end);
  res.status(206);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});