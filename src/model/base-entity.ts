export interface BaseEntityData {
    id?: string;
    lastChangedAt?: number;
    lastChangedBy?: string;
}

export class BaseEntity {
    id: string | null;
    lastChangedAt: number | null;
    lastChangedBy: string | null;

    constructor(data: BaseEntityData = {}) {
        this.id = data.id || null;
        this.lastChangedAt = data.lastChangedAt || null;
        this.lastChangedBy = data.lastChangedBy || null;
    }

    isModifiedSince(timestamp: number): boolean {
        return !!this.lastChangedAt && this.lastChangedAt > timestamp;
    }

    validateConcurrency(providedTimestamp: number): void {
        if (this.lastChangedAt !== providedTimestamp) {
            throw new Error('Concurrent modification detected');
        }
    }

    static fromJSON(json: any): BaseEntity {
        return new BaseEntity({
            id: json.id,
            lastChangedAt: json.lastChangedAt,
            lastChangedBy: json.lastChangedBy
        });
    }
}