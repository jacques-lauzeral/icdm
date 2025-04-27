import * as neo4j from 'neo4j-driver';
import type { Driver, Session, Transaction, Record, Result } from 'neo4j-driver';

// Initialize and export Neo4j driver
const driver: Driver = neo4j.driver(
    process.env.NEO4J_URI || 'bolt://localhost:7687',
    neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASSWORD || 'password'
    )
);
