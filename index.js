const express = require('express');
const app = express();
const http = require('http').Server(app);
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const multer  = require('multer');
require('dotenv').config({ path: path.join(__dirname, '/.env') });
const upload = multer({ dest: 'uploads/' });

const processStatementFile = require('./routes/processStatementFile');
const PORT = process.env.PORT;
const INDEX_PATH = './index.html';

app.use(cors());

app.use((req, res, next) => {
  console.log(`--> ${req.method} ${req.path}`);
  next();
});

app.use(express.static(path.join(__dirname, '/../_site')));

app.get('/api/v1/parse-statement', upload.single('file'), processStatementFile);

app.get(['/*'], (req, res) => {
  console.log('Index file loading');
  res.sendFile(path.join(__dirname));
});

http.listen(PORT, () => {
  console.log(`listening on PORT ${PORT}, ${process.env.NODE_ENV} ENVIRONMENT.`);
});
