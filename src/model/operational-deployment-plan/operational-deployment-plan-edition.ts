import { BaseEntity, BaseEntityData } from '../base-entity';

export interface OperationalDeploymentPlanEditionData extends BaseEntityData {
    editionYear?: number;
    editionIndex?: number;
    targetDate?: string;
    publicationDate?: string;
}

export class OperationalDeploymentPlanEdition extends BaseEntity {
    editionYear: number | null;
    editionIndex: number | null;
    targetDate: string | null;
    publicationDate: string | null;

    constructor(data: OperationalDeploymentPlanEditionData = {}) {
        super(data);
        this.editionYear = data.editionYear || null;
        this.editionIndex = data.editionIndex || null;
        this.targetDate = data.targetDate || null;
        this.publicationDate = data.publicationDate || null;
    }

    validate(): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.editionYear || this.editionYear  % 1 !== 0) {
            errors.push('Edition year must be a valid integer');
        }

        if (!this.editionIndex || this.editionIndex  % 1 !== 0 || this.editionIndex < 1) {
            errors.push('Edition index must be a positive integer');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    toJSON(): object {
        return {
            id: this.id,
            editionYear: this.editionYear,
            editionIndex: this.editionIndex,
            targetDate: this.targetDate,
            publicationDate: this.publicationDate,
            lastChangedAt: this.lastChangedAt,
            lastChangedBy: this.lastChangedBy
        };
    }

    static fromJSON(json: any): OperationalDeploymentPlanEdition {
        return new OperationalDeploymentPlanEdition({
            id: json.id,
            editionYear: json.editionYear,
            editionIndex: json.editionIndex,
            targetDate: json.targetDate,
            publicationDate: json.publicationDate,
            lastChangedAt: json.lastChangedAt,
            lastChangedBy: json.lastChangedBy
        });
    }
}
