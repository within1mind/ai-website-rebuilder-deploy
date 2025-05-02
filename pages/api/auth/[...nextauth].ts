import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export default NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!
    })
    // Add other providers here if necessary
  ],
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }): Promise<string> {
      // Only perform redirect logic in production. In development, return the baseUrl.
      if (process.env.NODE_ENV !== "production") {
        return "http://localhost:3000";
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  }
}); 