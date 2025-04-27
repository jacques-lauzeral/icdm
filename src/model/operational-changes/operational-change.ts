import { BaseEntity, BaseEntityData } from '../base-entity';

export interface OperationalChangeData extends BaseEntityData {
    shortName?: string;
    description?: string;
}

export class OperationalChange extends BaseEntity {
    shortName: string;
    description: string;

    constructor(data: OperationalChangeData = {}) {
        super(data);
        this.shortName = data.shortName || '';
        this.description = data.description || '';
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
            description: this.description,
            lastChangedAt: this.lastChangedAt,
            lastChangedBy: this.lastChangedBy
        };
    }

    static fromJSON(json: any): OperationalChange {
        return new OperationalChange({
            id: json.id,
            shortName: json.shortName,
            description: json.description,
            lastChangedAt: json.lastChangedAt,
            lastChangedBy: json.lastChangedBy
        });
    }
}
