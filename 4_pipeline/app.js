const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res)=>{
  res.send('<h1>hello from kubernetis!<h1>');
});

app.get('/metrics', (req, res) =>{
  res.set('Content-Type', 'text/plain');
  res.send('custom_http_request_total 42\n');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
