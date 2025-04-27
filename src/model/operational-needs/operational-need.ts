import { BaseEntity, BaseEntityData } from '../base-entity';

export interface OperationalNeedData extends BaseEntityData {
    shortName?: string;
}

export class OperationalNeed extends BaseEntity {
    shortName: string;

    constructor(data: OperationalNeedData = {}) {
        super(data);
        this.shortName = data.shortName || '';
    }

    validate(): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.shortName || this.shortName.trim() === '') {
            errors.push('Short name is required');
        }

        if (this.shortName && this.shortName.length > 50) {
            errors.push('Short name cannot exceed 50 characters');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    toJSON(): object {
        return {
            id: this.id,
            shortName: this.shortName,
            lastChangedAt: this.lastChangedAt,
            lastChangedBy: this.lastChangedBy
        };
    }

    static fromJSON(json: any): OperationalNeed {
        return new OperationalNeed({
            id: json.id,
            shortName: json.shortName,
            lastChangedAt: json.lastChangedAt,
            lastChangedBy: json.lastChangedBy
        });
    }
}