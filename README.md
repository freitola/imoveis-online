# Documentação da API de Imóveis Online

Este projeto é uma API para gerenciamento de imóveis, incluindo funcionalidades de autenticação, cadastro de imóveis, favoritos e mais.

## Endpoints

### Autenticação

1. **Registro de Usuário**
   - **Endpoint**: `/api/register`
   - **Método**: `POST`
   - **Descrição**: Registra um novo usuário no sistema.
   - **Parâmetros**:
     - `name`: Nome do usuário.
     - `email`: Email do usuário.
     - `password`: Senha do usuário.
     - `role`: Papel do usuário (`cliente` ou `corretor`).
   - **Exemplo**:
     ```bash
     curl -X POST http://localhost:5001/api/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Usuario Teste",
       "email": "teste@teste.com",
       "password": "senha123",
       "role": "cliente"
     }'
     ```

2. **Login**
   - **Endpoint**: `/api/login`
   - **Método**: `POST`
   - **Descrição**: Autentica o usuário e retorna um token JWT.
   - **Parâmetros**:
     - `email`
     - `password`
   - **Exemplo**:
     ```bash
     curl -X POST http://localhost:5001/api/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "teste@teste.com",
       "password": "senha123"
     }'
     ```

### Imóveis

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
   - **Parâmetros (opcionais)**: `minPrice`, `maxPrice`, `location`, `bedrooms`, `orderBy`, `orderDirection`
   - **Exemplo**:
     ```bash
     curl -X GET "http://localhost:5001/api/properties?minPrice=300000&maxPrice=1000000&orderBy=price&orderDirection=ASC" \
     -H "Authorization: Bearer $AUTH_TOKEN"
     ```

### Favoritos

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

---

### Como rodar o projeto

1. Clone o projeto:
   ```bash
   git clone <repo-url>