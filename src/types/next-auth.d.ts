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
    id: string;
    accessLevel: 'admin' | 'user';
  }

  interface Room {
    id: string;
    name: string;
    capacity: number;
  }
}