
// import NextAuth from 'next-auth';
// import GoogleProvider from 'next-auth/providers/google';
// import GitHubProvider from 'next-auth/providers/github';
// import { DrizzleAdapter } from '@auth/drizzle-adapter';
// import { db } from '@/lib/db/drizzle';

// export const { handlers, auth, signIn, signOut } = NextAuth({
//   adapter: DrizzleAdapter(db),
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     }),
//     GitHubProvider({
//       clientId: process.env.GITHUB_ID,
//       clientSecret: process.env.GITHUB_SECRET,
//     }),
//   ],
//   secret: process.env.NEXTAUTH_SECRET,
//   session: {
//     strategy: 'jwt',
//   },
//   callbacks: {
//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.id as string;
//         session.user.name = token.name;
//         session.user.email = token.email;
//         session.user.image = token.picture;
//       }
//       return session;
//     },
//     async jwt({ token, user }) {
//       const dbUser = await db.query.users.findFirst({
//         where: (users, { eq }) => eq(users.email, token.email!),
//       });

//       if (!dbUser) {
//         if (user) {
//           token.id = user?.id;
//         }
//         return token;
//       }

//       return {
//         id: dbUser.id,
//         name: dbUser.name,
//         email: dbUser.email,
//         picture: dbUser.image,
//       };
//     },
//   },
// });
