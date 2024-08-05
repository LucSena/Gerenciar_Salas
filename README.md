# 🏢 Agendei - Sistema de Gerenciamento de Salas de Reunião

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![NextAuth](https://img.shields.io/badge/NextAuth-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://next-auth.js.org/)
[![ShadcnUI](https://img.shields.io/badge/ShadcnUI-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Railway](https://img.shields.io/badge/Railway-131415?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app/)

## 📝 Descrição

**Simplifique o agendamento de suas reuniões**

O Agendei oferece uma solução intuitiva para gerenciar salas de reunião, permitindo que sua equipe foque no que realmente importa: colaboração eficaz.

### Principais Características:

- **Reserva de Salas**: Visualize a disponibilidade e faça reservas facilmente
- **Gerenciamento de Salas**: Crie, atualize e exclua salas de reunião (admin)
- **Níveis de Acesso**: Administradores e usuários comuns
- **Segurança**: Autenticação robusta e proteção contra SQL Injection

🔗 [Acesse o Agendei aqui](https://gerenciar-salas.vercel.app)

## 🚀 Como executar localmente

Para executar este projeto em sua máquina local, siga estas etapas:

1. Clone o repositório:
```
git clone https://github.com/LucSena/Gerenciar_Salas.git
cd Gerenciar_Salas
```
2. Instale as dependências:
```
npm install
```

```
yarn install
```

3. Crie um arquivo `.env` na raiz do projeto. Há um arquivo `.env.example` para referência. Preencha as seguintes variáveis:
```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

4. Execute o comando do Prisma para criar as tabelas no banco de dados:
```
npx prisma db push
```
5. Inicie o servidor de desenvolvimento:
```
npm run dev
```
```
yarn dev
```
6. Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## 🛠️ Tecnologias Utilizadas

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [NextAuth](https://next-auth.js.org/)
- [ShadcnUI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MySQL](https://www.mysql.com/)

## 🚀 Deploy

- Front-end: [Vercel](https://vercel.com/)
- Banco de Dados: [Railway](https://railway.app/)

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma issue ou enviar um pull request.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

© 2024 Agendei - Sistema de Gerenciamento de Salas. Todos os direitos reservados.
