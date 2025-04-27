import { Driver, Session, Transaction } from 'neo4j-driver';
import driver from './neo4j-driver';

// Define interface for session data
interface SessionData {
    session: Session;
    tx: Transaction;
}

// Define interface for transaction result
interface TransactionResult {
    transactionId: string;
    status: 'active' | 'committed' | 'rolled back' | 'error';
    error?: string;
}

/**
 * Service for managing Neo4j transactions
 */
export class TransactionService {
    private activeSessions: Map<string, SessionData>;

    constructor() {
        this.activeSessions = new Map<string, SessionData>();
    }

    /**
     * Start a new transaction
     * @param clientId - Unique identifier for the client session
     * @returns Transaction info
     */
    async startTransaction(clientId: string): Promise<TransactionResult> {
        if (this.activeSessions.has(clientId)) {
            throw new Error('Transaction already in progress for this client');
        }

        const session = driver.session();
        const tx = session.beginTransaction();

        this.activeSessions.set(clientId, { session, tx });

        return {
            transactionId: clientId,
            status: 'active'
        };
    }

    /**
     * Commit a transaction
     * @param clientId - Client session identifier
     * @returns Result of commit operation
     */
    async commitTransaction(clientId: string): Promise<TransactionResult> {
        const sessionData = this.activeSessions.get(clientId);
        if (!sessionData) {
            throw new Error('No active transaction found for this client');
        }

        try {
            await sessionData.tx.commit();
            await sessionData.session.close();
            this.activeSessions.delete(clientId);

            return {
                transactionId: clientId,
                status: 'committed'
            };
        } catch (error) {
            // Close session but don't remove from map to prevent reuse
            await sessionData.session.close();
            this.activeSessions.delete(clientId);

            return {
                transactionId: clientId,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error during commit'
            };
        }
    }

    /**
     * Roll back a transaction
     * @param clientId - Client session identifier
     * @returns Result of rollback operation
     */
    async rollbackTransaction(clientId: string): Promise<TransactionResult> {
        const sessionData = this.activeSessions.get(clientId);
        if (!sessionData) {
            throw new Error('No active transaction found for this client');
        }

        try {
            await sessionData.tx.rollback();
            await sessionData.session.close();
            this.activeSessions.delete(clientId);

            return {
                transactionId: clientId,
                status: 'rolled back'
            };
        } catch (error) {
            // Close session and remove from map
            await sessionData.session.close();
            this.activeSessions.delete(clientId);

            return {
                transactionId: clientId,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error during rollback'
            };
        }
    }

    /**
     * Get active transaction
     * @param clientId - Client session identifier
     * @returns Transaction object or null
     */
    getTransaction(clientId: string): Transaction | null {
        const sessionData = this.activeSessions.get(clientId);
        return sessionData ? sessionData.tx : null;
    }

    /**
     * Check if client has an active transaction
     * @param clientId - Client session identifier
     * @returns True if client has an active transaction
     */
    hasActiveTransaction(clientId: string): boolean {
        return this.activeSessions.has(clientId);
    }

    /**
     * Execute function in transaction
     * @param txFunc - Function that takes tx as parameter
     * @param params - Parameters to pass to txFunc
     * @returns Result of the transaction function
     */
    async executeInTransaction<T, P>(
        txFunc: (tx: Transaction, params: P) => Promise<T>,
        params: P
    ): Promise<T> {
        const session = driver.session();

        try {
            return await session.executeWrite(txWork => txFunc(txWork, params));
        } finally {
            await session.close();
        }
    }

    /**
     * Execute read-only function in transaction
     * @param txFunc - Function that takes tx as parameter
     * @param params - Parameters to pass to txFunc
     * @returns Result of the transaction function
     */
    async executeInReadTransaction<T, P>(
        txFunc: (tx: Transaction, params: P) => Promise<T>,
        params: P
    ): Promise<T> {
        const session = driver.session();

        try {
            return await session.executeRead(txWork => txFunc(txWork, params));
        } finally {
            await session.close();
        }
    }

    /**
     * Close all active sessions (useful for cleanup)
     */
    async closeAllSessions(): Promise<void> {
        const closePromises: Promise<void>[] = [];

        this.activeSessions.forEach(({ session }) => {
            closePromises.push(session.close());
        });

        await Promise.all(closePromises);
        this.activeSessions.clear();
    }
}

// Export singleton instance
export const transactionService = new TransactionService();
export default transactionService;