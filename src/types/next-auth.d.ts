import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name: string;
      email: string;
      accessLevel: 'admin' | 'user';
    } & DefaultSession["user"]
  }

  interface User {
    accessLevel: 'admin' | 'user';
  }
}