import { BaseEntity, BaseEntityData } from './base-entity';

export interface NamedEntityData extends BaseEntityData {
    name?: string;
    description?: string;
}

export class NamedEntity extends BaseEntity {
    name: string;
    description: string;

    constructor(data: NamedEntityData = {}) {
        super(data);
        this.name = data.name || '';
        this.description = data.description || '';
    }

    validate(): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.name || this.name.trim() === '') {
            errors.push('Name is required');
        }

        if (this.name && this.name.length > 100) {
            errors.push('Name cannot exceed 100 characters');
        }

        if (this.description && this.description.length > 1000) {
            errors.push('Description cannot exceed 1000 characters');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    toJSON(): object {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            lastChangedAt: this.lastChangedAt,
            lastChangedBy: this.lastChangedBy
        };
    }

    static fromJSON(json: any): NamedEntity {
        return new NamedEntity({
            id: json.id,
            name: json.name,
            description: json.description,
            lastChangedAt: json.lastChangedAt,
            lastChangedBy: json.lastChangedBy
        });
    }
}
