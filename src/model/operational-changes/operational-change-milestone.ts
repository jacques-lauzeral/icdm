import { BaseEntity, BaseEntityData } from '../base-entity';

export interface OperationalChangeMilestoneData extends BaseEntityData {
    shortName?: string;
    description?: string;
    relativeDate?: number;
}

export class OperationalChangeMilestone extends BaseEntity {
    shortName: string;
    description: string;
    relativeDate: number;

    constructor(data: OperationalChangeMilestoneData = {}) {
        super(data);
        this.shortName = data.shortName || '';
        this.description = data.description || '';
        this.relativeDate = data.relativeDate || 0;
    }

    validate(): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.shortName || this.shortName.trim() === '') {
            errors.push('Short name is required');
        }

        if (this.shortName && this.shortName.length > 50) {
            errors.push('Short name cannot exceed 50 characters');
        }

        if (this.relativeDate  % 1 !== 0) {
            errors.push('Relative date must be an integer');
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
            relativeDate: this.relativeDate,
            lastChangedAt: this.lastChangedAt,
            lastChangedBy: this.lastChangedBy
        };
    }

    static fromJSON(json: any): OperationalChangeMilestone {
        return new OperationalChangeMilestone({
            id: json.id,
            shortName: json.shortName,
            description: json.description,
            relativeDate: json.relativeDate,
            lastChangedAt: json.lastChangedAt,
            lastChangedBy: json.lastChangedBy
        });
    }
}