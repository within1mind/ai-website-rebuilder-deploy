declare module 'next-auth' {
  import { NextApiHandler } from 'next';
  export interface NextAuthOptions {
    providers?: any[];
    callbacks?: {
      redirect?: (params: { url: string; baseUrl: string }) => Promise<string> | string;
    };
  }
  function NextAuth(options: NextAuthOptions): NextApiHandler;
  export default NextAuth;
}

declare module 'next-auth/providers/github' {
  interface GitHubProviderOptions {
    clientId: string;
    clientSecret: string;
  }
  const GitHubProvider: (options: GitHubProviderOptions) => any;
  export default GitHubProvider;
} 