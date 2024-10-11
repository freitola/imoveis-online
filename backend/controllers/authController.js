const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Função de login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// Função de registro
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: 'Usuário já existe.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({ name, email, password: hashedPassword, role });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// Função para deletar um usuário - Somente Admin
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    await user.destroy();
    res.json({ message: 'Usuário removido com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor ao tentar remover o usuário.' });
  }
};