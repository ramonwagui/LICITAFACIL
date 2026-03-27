const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/convenios', (req, res) => {
  res.json([{ id: 1, numero: '001', ano: 2025, objeto: 'Teste', concedente: 'Governo', status: 'em_andamento' }]);
});

app.listen(PORT, () => {
  console.log('✅ Test server running on port ' + PORT);
});