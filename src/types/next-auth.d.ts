import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { AdapterUser } from '@auth/core/adapters';

declare module '@auth/core/adapters' {
    interface AdapterUser {
        planType: string;
        businessName?: string;
    }
}

declare module 'next-auth' {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string;
            planType: string;
            businessName?: string;
        } & DefaultSession['user'];
    }

    interface User extends DefaultUser {
        id: string;
        planType: string;
        businessName?: string;
    }
}

declare module 'next-auth/jwt' {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
        id: string;
        planType: string;
        businessName?: string;
    }
}