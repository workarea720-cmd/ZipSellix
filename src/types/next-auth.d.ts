import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { AdapterUser } from '@auth/core/adapters';

declare module '@auth/core/adapters' {
    interface AdapterUser {
        planType: string;
        businessName?: string;
        provider?: string;         // ← added
    }
}

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            planType: string;
            businessName?: string;
            provider?: string;     // ← added
        } & DefaultSession['user'];
    }

    interface User extends DefaultUser {
        id: string;
        planType: string;
        businessName?: string;
        provider?: string;         // ← added
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        planType: string;
        businessName?: string;
        provider?: string;         // ← added
    }
}