const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');  // Certifique-se de que o caminho está correto

// Função de registro
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Verifica se o usuário já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'E-mail já está em uso' });
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria um novo usuário
    const user = await User.create({ name, email, password: hashedPassword, role });

    res.json({ message: 'Usuário registrado com sucesso', user });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
};

// Função de login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verifica se o usuário existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verifica se a senha está correta
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Gera um token JWT
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login bem-sucedido', token });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
};