import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from 'cors'
import fs from 'fs'
import { exec, spawn } from 'child_process';
import { once } from 'events';
import multer from 'multer';

const app = express();
const port = 3000;

const Filename = fileURLToPath(import.meta.url); // 2. Get current file path
const Dirname = path.dirname(Filename);  // 3. Get directory path
//console.log("filename: ", Filename, "and dirname: ", Dirname);
app.use(cors());

// Serve everything inside the "public" folder at the root path
app.use(express.static(path.join(Dirname, 'videos')));

const upload = multer({ dest: path.join(Dirname, 'uploads/') });

app.get('/', (req, res) => {
  res.send('Hello World! yo')
});

// 2. Add the /upload POST route matching name="video" from your form
app.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No video file uploaded.');
  }

  console.log('File uploaded successfully:');
  console.log('Original Name:', req.file.originalname);
  console.log('Saved Path:', req.file.path);

  // req.file details will look like this:
  // req.file.path -> '.../uploads/3a8c7b6d1e...' (temporary file location)

  /* res.send({
    message: 'Video uploaded successfully!',
    fileInfo: {
      originalName: req.file.originalname,
      tempPath: req.file.path,
      size: req.file.size
    }
  }); */
});

/* app.get('/convert', (req, res) => {
  const inputVideo = path.join(Dirname, "videos", "COTE_S1_EP1_VF_Extract.mp4");
  const outputPlaylist = path.join(Dirname, "videos/test-video2", "outputPlaylist.m3u8");

  // Make sure output folder exists
  fs.mkdirSync(path.join(Dirname, "videos/test-video2"), { recursive: true });

  const ffmpeg = spawn('ffmpeg', [
    '-i', inputVideo,
    '-c:v', 'h264',
    '-flags', '+cgop',
    '-g', '30',
    '-hls_time', '60',
    '-hls_list_size', '0',
    outputPlaylist
  ]);

  ffmpeg.on('close', (code) => {
    if (code === 0) {
      res.send('Conversion complete! HLS files ready.');
      console.log('Conversion complete! HLS files ready.');
    } else {
      res.status(500).send('FFmpeg failed.');
      console.log('FFmpeg failed.');
    }
  });
}); */

/* app.get('/video', (req, res) => {
  const range = req.headers.range;
  const videoPath = path.join(Dirname, "videos", "The_FULL_2024_NBA_SlamDunk_Contest!.mp4");

  if (!range) {
    console.log('No range');

    //console.log('the video path is: ',videoPath)
    return res.status(200).sendFile(testVideoPath);
  }

  const videoSize = fs.statSync(testVideoPath).size;
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
}); */

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});