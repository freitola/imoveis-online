const Corretor = require('../models/Corretor');

// Listar todos os corretores
exports.getCorretores = async (req, res) => {
  try {
    const corretores = await Corretor.findAll();
    res.json(corretores);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar corretores.' });
  }
};

// Criar novo corretor
exports.createCorretor = async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const corretor = await Corretor.create({ name, email, phone });
    res.json(corretor);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar corretor.' });
  }
};

// Buscar corretor por ID
exports.getCorretorById = async (req, res) => {
  try {
    const corretor = await Corretor.findByPk(req.params.id);
    if (!corretor) {
      return res.status(404).json({ message: 'Corretor não encontrado.' });
    }
    res.json(corretor);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar corretor.' });
  }
};

// Atualizar corretor
exports.updateCorretor = async (req, res) => {
  try {
    const corretor = await Corretor.findByPk(req.params.id);
    if (!corretor) {
      return res.status(404).json({ message: 'Corretor não encontrado.' });
    }

    const { name, email, phone } = req.body;
    corretor.name = name || corretor.name;
    corretor.email = email || corretor.email;
    corretor.phone = phone || corretor.phone;

    await corretor.save();
    res.json(corretor);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar corretor.' });
  }
};

// Deletar corretor
exports.deleteCorretor = async (req, res) => {
  try {
    const corretor = await Corretor.findByPk(req.params.id);
    if (!corretor) {
      return res.status(404).json({ message: 'Corretor não encontrado.' });
    }

    await corretor.destroy();
    res.json({ message: 'Corretor removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover corretor.' });
  }
};