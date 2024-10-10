const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Joi = require('joi');

// Esquema de validação com Joi
const registerSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('cliente', 'corretor').required(),
});

// Registro de usuário
exports.register = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword, role });

    res.json({ message: 'Usuário registrado com sucesso', user });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Email já registrado.' });
    }
    res.status(500).json({ message: 'Erro no servidor. Tente novamente mais tarde.' });
  }
};

// Login de usuário
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ message: 'Login bem-sucedido', token });
};