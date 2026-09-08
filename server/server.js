import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from 'cors'
import fs from 'fs'
import { exec, spawn } from 'child_process';
import { once } from 'events';
import multer from 'multer';
import crypto from 'crypto';

const app = express();
const port = 3000;

const Filename = fileURLToPath(import.meta.url); // 2. Get current file path
const Dirname = path.dirname(Filename);  // 3. Get directory path
console.log("filename: ", Filename, "and dirname: ", Dirname);

// Ensure upload destination folder exists
const uploadDir = path.join(Dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });

app.use(cors());

// Serve everything inside the "public" folder at the root path
app.use(express.static(path.join(Dirname, 'videos')));

app.get('/', (req, res) => {
  res.send('Hello World! yo')
});

// 2. Add the /upload POST route matching name="video" from your form
app.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No video file uploaded.');
  }

  // 1. Generate a unique ID for this video (avoids collisions and dangerous characters)
  const videoId = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  
  // 2. Define output directory inside "videos/"
  const outputDir = path.join(Dirname, 'videos', videoId);
  fs.mkdirSync(outputDir, { recursive: true });

  const outputPlaylist = path.join(outputDir, 'outputFile.m3u8');
  const inputVideoPath = req.file.path; // Path saved by Multer

  console.log(`[Processing] Starting FFmpeg for video ID: ${videoId}`);

  // 3. Trigger FFmpeg with Multer's saved file path
  const ffmpeg = spawn('ffmpeg', [
    '-i', inputVideoPath,
    '-c:v', 'h264',
    '-flags', '+cgop',
    '-g', '30',
    '-hls_time', '10',
    '-hls_list_size', '0',
    outputPlaylist
  ]);

  ffmpeg.stderr.on('data', (data) => {
    console.log(`FFmpeg Progress: ${data}`); // Optional: uncomment for progress logs
  });

  ffmpeg.on('close', (code) => {
    // 4. Clean up the temporary uploaded source file after processing
    if (fs.existsSync(inputVideoPath)) {
      fs.unlinkSync(inputVideoPath);
    }

    if (code === 0) {
      console.log(`[Success] Conversion complete for: ${videoId}`);
      res.send({
        message: 'Video uploaded and converted successfully!',
        videoId: videoId,
        playlistUrl: `http://localhost:3000/${videoId}/outputFile.m3u8`
      });
    } else {
      console.error(`[Error] FFmpeg process failed with code ${code}`);
      res.status(500).send('Video processing failed.');
    }
  });
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