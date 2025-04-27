import { NamedEntity, NamedEntityData } from '../named-entity';

export interface StakeholderCategoryData extends NamedEntityData {
    // Add any StakeholderCategory-specific properties here
}

export class StakeholderCategory extends NamedEntity {
    constructor(data: StakeholderCategoryData = {}) {
        super(data);
    }

    // Any StakeholderCategory-specific methods could go here

    static fromJSON(json: any): StakeholderCategory {
        return new StakeholderCategory({
            id: json.id,
            name: json.name,
            description: json.description,
            lastChangedAt: json.lastChangedAt,
            lastChangedBy: json.lastChangedBy
        });
    }
}