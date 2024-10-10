const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  
  // Verifica se o email já existe
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) return res.status(400).json({ message: 'Usuário já registrado' });

  // Criptografa a senha
  const hashedPassword = await bcrypt.hash(password, 10);

  // Cria o novo usuário
  const newUser = await User.create({ name, email, password: hashedPassword, role });

  // Gera o token JWT
  const token = jwt.sign({ id: newUser.id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.status(201).json({ message: 'Usuário registrado com sucesso', token });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    // Verifica se o usuário existe
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  
    // Verifica a senha
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Senha incorreta' });
  
    // Gera o token JWT
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
    res.status(200).json({ message: 'Login bem-sucedido', token });
  };