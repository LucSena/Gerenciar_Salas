## Descrição
Este desafio técnico consiste em desenvolver um sistema de reserva de salas de reunião para uma empresa, utilizando Next.js, TailwindCSS, Prisma e ShadcnUI. O sistema deve permitir que os usuários se registrem e façam login, e que os administradores gerenciem as salas de reunião. Usuários autenticados devem poder visualizar a disponibilidade das salas e fazer reservas.

**Requisitos:**
- **Next.js:** Utilize Next.js para o desenvolvimento do frontend e backend.
- **Prisma:** Utilize Prisma como ORM para interagir com o banco de dados.
- **TailwindCSS:** Utilize TailwindCSS para estilização.
- **ShadcnUI:** Utilize ShadcnUI para componentes de interface de usuário.

**Opcional:**
- **Autenticação:** Utilize NextAuth.js para gerenciar autenticação e autorização.

Esta abordagem assegura um código mais moderno e modular, facilitando a manutenção e a escalabilidade do sistema.


## Funcionalidades
Esse desafio precisa obrigatoriamente implementar essas funcionalidades abaixo, fique à vontade para adicionar mais funcionalidades que agreguem ao projeto sem mudar o objetivo principal da aplicação.

- **Cadastro de Usuários**
  - Registro de novos usuários.
  - Login de usuários existentes.
  - Diferentes níveis de acesso (administrador e usuário comum).

- **Gerenciamento de Salas**
  - Administradores podem criar, atualizar e excluir salas de reunião.
  - Informações das salas incluem nome, capacidade e localização.

- **Reserva de Salas**
  - Usuários podem visualizar a disponibilidade das salas.
  - Usuários podem fazer reservas especificando sala, data, hora de início e término.

- **Validações**
  - Campos obrigatórios devem ser preenchidos.
  - Verificação de unicidade de email.
  - Garantia de que uma sala não pode ser reservada por mais de um usuário no mesmo horário.

- **Segurança**
  - Proteção contra SQL Injection.
  - Acesso às páginas de gerenciamento restrito a usuários autenticados.

## Estrutura Sugerida do Banco de Dados
(Fique livre para criar sua estrutura com outras tabelas caso ache necessário).

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    access_level ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    user_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
