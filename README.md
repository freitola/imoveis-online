# Imobiliária Online - Documentação do Projeto Full Stack

Este projeto é um sistema completo para gerenciamento de imóveis com funcionalidades de autenticação de usuários, cadastro de imóveis, gerenciamento de favoritos e agendamento de visitas.

## Funcionalidades Principais

- **Autenticação de usuários**: Suporte para usuários com papéis diferentes (`cliente`, `corretor`, `admin`).
- **Gerenciamento de imóveis**: Corretores podem adicionar, editar, listar e excluir imóveis.
- **Gerenciamento de corretores**: Admin pode cadastrar, editar e excluir corretores.
- **Favoritos**: Clientes podem adicionar imóveis aos favoritos e gerenciá-los.
- **Página de Imóveis em Destaque**: Mostra os três imóveis mais caros na página inicial.
- **Página de FAQ**: Explicações detalhadas sobre compra, venda e agendamento de visitas.
- **Botão de contato via WhatsApp**: Fácil acesso para clientes entrarem em contato com corretores sobre imóveis.

---

## Endpoints da API

### **Autenticação**

1. **Registro de Usuário**
   - **Endpoint**: `/api/auth/register`
   - **Método**: `POST`
   - **Descrição**: Registra um novo usuário no sistema.
   - **Parâmetros**:
     - `name`: Nome do usuário.
     - `email`: Email do usuário.
     - `password`: Senha do usuário.
     - `role`: Papel do usuário (`cliente`, `corretor`, `admin`).
   - **Exemplo**:
     ```bash
     curl -X POST http://localhost:5001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Usuario Teste",
       "email": "teste@teste.com",
       "password": "senha123",
       "role": "cliente"
     }'
     ```

2. **Login**
   - **Endpoint**: `/api/auth/login`
   - **Método**: `POST`
   - **Descrição**: Autentica o usuário e retorna um token JWT.
   - **Parâmetros**:
     - `email`
     - `password`
   - **Exemplo**:
     ```bash
     curl -X POST http://localhost:5001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "teste@teste.com",
       "password": "senha123"
     }'
     ```

3. **Excluir Usuário**
   - **Endpoint**: `/api/auth/users/:id`
   - **Método**: `DELETE`
   - **Descrição**: Permite que o admin exclua um usuário.
   - **Exemplo**:
     ```bash
     curl -X DELETE http://localhost:5001/api/auth/users/3 \
     -H "Authorization: Bearer $AUTH_TOKEN"
     ```

### **Imóveis**

1. **Criar Imóvel**
   - **Endpoint**: `/api/properties`
   - **Método**: `POST`
   - **Descrição**: Cria um novo imóvel (apenas corretores).
   - **Parâmetros**:
     - `title`, `price`, `location`, `bedrooms`, `bathrooms`, `size`, `type`, `image` (opcional)
   - **Exemplo**:
     ```bash
     curl -X POST http://localhost:5001/api/properties \
     -H "Authorization: Bearer $AUTH_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Chácara Espetacular",
       "price": 850000,
       "location": "Campinas",
       "bedrooms": 4,
       "bathrooms": 3,
       "size": 400,
       "type": "chácara"
     }'
     ```

2. **Listar Imóveis com Filtros e Ordenação**
   - **Endpoint**: `/api/properties`
   - **Método**: `GET`
   - **Parâmetros (opcionais)**: `minPrice`, `maxPrice`, `location`, `bedrooms`, `orderBy`, `orderDirection`, `limit`, `page`
   - **Exemplo**:
     ```bash
     curl -X GET "http://localhost:5001/api/properties?minPrice=300000&maxPrice=1000000&orderBy=price&orderDirection=ASC" \
     -H "Authorization: Bearer $AUTH_TOKEN"
     ```

3. **Modificar Imóvel**
   - **Endpoint**: `/api/properties/:id`
   - **Método**: `PUT`
   - **Descrição**: Atualiza os dados de um imóvel específico (apenas corretores).
   - **Parâmetros**: Mesmos parâmetros do cadastro de imóvel.
   - **Exemplo**:
     ```bash
     curl -X PUT http://localhost:5001/api/properties/5 \
     -H "Authorization: Bearer $AUTH_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Casa Atualizada",
       "price": 750000,
       "bedrooms": 4
     }'
     ```

4. **Excluir Imóvel**
   - **Endpoint**: `/api/properties/:id`
   - **Método**: `DELETE`
   - **Descrição**: Exclui um imóvel cadastrado (apenas corretores).
   - **Exemplo**:
     ```bash
     curl -X DELETE http://localhost:5001/api/properties/5 \
     -H "Authorization: Bearer $AUTH_TOKEN"
     ```

### **Favoritos**

1. **Adicionar Imóvel aos Favoritos**
   - **Endpoint**: `/api/favorites`
   - **Método**: `POST`
   - **Parâmetros**: `propertyId`
   - **Exemplo**:
     ```bash
     curl -X POST http://localhost:5001/api/favorites \
     -H "Authorization: Bearer $AUTH_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "propertyId": 2
     }'
     ```

2. **Listar Imóveis Favoritos**
   - **Endpoint**: `/api/favorites`
   - **Método**: `GET`
   - **Exemplo**:
     ```bash
     curl -X GET http://localhost:5001/api/favorites \
     -H "Authorization: Bearer $AUTH_TOKEN"
     ```

3. **Remover Imóvel dos Favoritos**
   - **Endpoint**: `/api/favorites/:propertyId`
   - **Método**: `DELETE`
   - **Exemplo**:
     ```bash
     curl -X DELETE http://localhost:5001/api/favorites/2 \
     -H "Authorization: Bearer $AUTH_TOKEN"
     ```

### **Corretores**

1. **Listar Corretores**
   - **Endpoint**: `/api/corretores`
   - **Método**: `GET`
   - **Descrição**: Lista todos os corretores cadastrados (acessível apenas para administradores).
   - **Exemplo**:
     ```bash
     curl -X GET http://localhost:5001/api/corretores \
     -H "Authorization: Bearer $AUTH_TOKEN"
     ```

2. **Adicionar Corretor**
   - **Endpoint**: `/api/corretores`
   - **Método**: `POST`
   - **Descrição**: Admin pode cadastrar um novo corretor.
   - **Parâmetros**:
     - `name`, `email`, `password`
   - **Exemplo**:
     ```bash
     curl -X POST http://localhost:5001/api/corretores \
     -H "Authorization: Bearer $AUTH_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Corretor Teste",
       "email": "corretor@teste.com",
       "password": "senha123"
     }'
     ```

3. **Atualizar Corretor**
   - **Endpoint**: `/api/corretores/:id`
   - **Método**: `PUT`
   - **Descrição**: Atualiza os dados de um corretor cadastrado.
   - **Exemplo**:
     ```bash
     curl -X PUT http://localhost:5001/api/corretores/1 \
     -H "Authorization: Bearer $AUTH_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Novo Nome",
       "email": "novoemail@teste.com"
     }'
     ```

4. **Excluir Corretor**
   - **Endpoint**: `/api/corretores/:id`
   - **Método**: `DELETE`
   - **Exemplo**:
     ```bash
     curl -X DELETE http://localhost:5001/api/corretores/2 \
     -H "Authorization: Bearer $AUTH_TOKEN"
     ```

---

## Como rodar o projeto

1. **Clone o repositório**:
   ```bash
   git clone <repo-url>

2.	**Instale as dependências**:
  ```bash
  cd backend
  npm install
  ```

3.	**Configure o banco de dados**:
	-	Certifique-se de que o PostgreSQL está rodando.
	-	Atualize o arquivo config.json com as configurações corretas do banco de dados.

4.	**Rode as migrações e seeders (opcional)**:
  ```bash
  npx sequelize-cli db:migrate
  ```

5.	**Inicie o servidor**:
  ```bash
  npm run dev
  ```

6.	**Acesse o frontend**:
	-	O frontend está configurado para rodar em Next.js. Para iniciar o frontend, use:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

## Funcionalidades no Frontend

-	**Página Inicial**: Mostra informações sobre o corretor Marcelo Braz e os três imóveis mais caros cadastrados no sistema.
-	**Página de Imóveis**: Lista todos os imóveis cadastrados, com filtros avançados.
-	**Página de Favoritos**: Clientes podem gerenciar seus imóveis favoritos.
-	**Página de Detalhes do Imóvel**: Mostra informações detalhadas de cada imóvel, com opção de contato via WhatsApp.
-	**FAQ**: Explicações detalhadas sobre compra, venda e aluguel.
