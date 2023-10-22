const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const { Pool } = require('pg');
const dbConfig = require('./dbConfig'); // Importe as configurações do banco de dados

const pool = new Pool({
    connectionString: dbConfig.connectionString,
});

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.get('/',(req,res) => {
    res.json({ info: 'Node.js, Exprers and Postres API'})
});

// GET
app.get('/curriculos', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM Curriculos');
      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao consultar o banco de dados:', error);
      res.status(500).send('Erro interno do servidor');
    }
});

// GET BY ID
app.get('/curriculo/:id', async (req, res) => {
    const curriculoId = req.params.id;
  
    try {
      const result = await pool.query('SELECT * FROM Curriculos WHERE id = $1', [curriculoId]);
  
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Currículo não encontrado' });
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      console.error('Erro ao consultar o banco de dados:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// POST 
    app.post('/criarCurriculo', async (req, res) => {
        const { nome, email, telefone, formacao, experiencia } = req.body;
    

        if (nome == null || email == null) {
            return res.status(400).json({ message: 'Nome e email são campos obrigatórios' });
        }
        try {
        const result = await pool.query(
            'INSERT INTO Curriculos (nome, email, telefone, formacao, experiencia) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nome, email, telefone, formacao, experiencia]
        );
    
        res.status(201).json(result.rows[0]);
        } catch (error) {
        console.error('Erro ao inserir no banco de dados:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });

// UPDATE
app.put('/curriculo/:id', async (req, res) => {
    const curriculoId = req.params.id;
    const { nome, email, telefone, formacao, experiencia } = req.body;
  
    if (!nome || !email) {
      return res.status(400).json({ message: 'Nome e email são campos obrigatórios' });
    }
  
    try {
      const result = await pool.query(
        'UPDATE Curriculos SET nome = $1, email = $2, telefone = $3, formacao = $4, experiencia = $5 WHERE id = $6 RETURNING *',
        [nome, email, telefone, formacao, experiencia, curriculoId]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Currículo não encontrado' });
      }
  
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar no banco de dados:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// DELETE
app.delete('/curriculo/:id', async (req, res) => {
    const curriculoId = req.params.id;
  
    try {
      const result = await pool.query('DELETE FROM Curriculos WHERE id = $1 RETURNING *', [curriculoId]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Currículo não encontrado' });
      }
  
      res.json({ message: 'Currículo removido com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir do banco de dados:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
});