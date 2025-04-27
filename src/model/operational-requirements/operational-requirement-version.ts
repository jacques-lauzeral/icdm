import { BaseEntity, BaseEntityData } from '../base-entity';

export interface OperationalRequirementVersionData extends BaseEntityData {
    version?: number;
    published?: boolean;
    description?: string;
}

export class OperationalRequirementVersion extends BaseEntity {
    version: number;
    published: boolean;
    description: string;

    constructor(data: OperationalRequirementVersionData = {}) {
        super(data);
        this.version = data.version || 1;
        this.published = data.published || false;
        this.description = data.description || '';
    }

    validate(): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (this.version % 1 !== 0 || this.version < 1) {
            errors.push('Version must be a positive integer');
        }

        if (typeof this.published !== 'boolean') {
            errors.push('Published flag must be a boolean');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    publish(): void {
        if (this.published) {
            throw new Error('This version is already published');
        }
        this.published = true;
    }

    canBeModified(): boolean {
        return !this.published;
    }

    toJSON(): object {
        return {
            id: this.id,
            version: this.version,
            published: this.published,
            description: this.description,
            lastChangedAt: this.lastChangedAt,
            lastChangedBy: this.lastChangedBy
        };
    }

    static fromJSON(json: any): OperationalRequirementVersion {
        return new OperationalRequirementVersion({
            id: json.id,
            version: json.version,
            published: json.published,
            description: json.description,
            lastChangedAt: json.lastChangedAt,
            lastChangedBy: json.lastChangedBy
        });
    }
}