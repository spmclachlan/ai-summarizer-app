const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

const NCBI_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const ICITE_URL = 'https://icite.od.nih.gov/api/pubs';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-preview-09-2025';
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;

// Health endpoint
app.get('/api/health', (req, res) => res.json({ ok: true }));

// ESearch proxy (GET)
app.get('/api/esearch', async (req, res) => {
  try {
    const { term = '', retmax = 100 } = req.query;
    const url = `${NCBI_BASE}/esearch.fcgi?db=pubmed&retmode=json&retmax=${encodeURIComponent(retmax)}&term=${encodeURIComponent(term)}`;
    const r = await fetch(url);
    const text = await r.text();
    res.type(r.headers.get('content-type') || 'application/json').status(r.status).send(text);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// EFetch proxy (PubMed XML)
app.get('/api/efetch', async (req, res) => {
  try {
    const { id = '' } = req.query;
    const url = `${NCBI_BASE}/efetch.fcgi?db=pubmed&retmode=xml&id=${encodeURIComponent(id)}`;
    const r = await fetch(url);
    const text = await r.text();
    res.type('application/xml').status(r.status).send(text);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ESummary proxy (JSON)
app.get('/api/esummary', async (req, res) => {
  try {
    const { id = '' } = req.query;
    const url = `${NCBI_BASE}/esummary.fcgi?db=pubmed&retmode=json&id=${encodeURIComponent(id)}`;
    const r = await fetch(url);
    const text = await r.text();
    res.type('application/json').status(r.status).send(text);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// PMC efetch proxy (returns XML)
app.get('/api/pmc', async (req, res) => {
  try {
    const { id = '' } = req.query; // accept '12345' or 'PMC12345'
    const pmc = String(id).replace(/^PMC/i, '');
    const url = `${NCBI_BASE}/efetch.fcgi?db=pmc&retmode=xml&id=${encodeURIComponent(pmc)}`;
    const r = await fetch(url);
    const text = await r.text();
    res.type('application/xml').status(r.status).send(text);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// iCite proxy (POST)
app.post('/api/icite', async (req, res) => {
  try {
    const { pmids = [] } = req.body;
    const r = await fetch(ICITE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pmids })
    });
    const json = await r.json();
    res.status(r.status).json(json);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Gemini / Google Generative Language proxy (server-side key)
app.post('/api/gemini', async (req, res) => {
  try {
    if (!GEMINI_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
    const r = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const json = await r.json();
    res.status(r.status).json(json);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Optionally serve static files when deploying together
// app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));