import { NamedEntity, NamedEntityData } from '../named-entity';

export interface RegulatoryAspectData extends NamedEntityData {
    // Add any RegulatoryAspect-specific properties here
}

export class RegulatoryAspect extends NamedEntity {
    constructor(data: RegulatoryAspectData = {}) {
        super(data);
    }

    // Any RegulatoryAspect-specific methods could go here

    static fromJSON(json: any): RegulatoryAspect {
        return new RegulatoryAspect({
            id: json.id,
            name: json.name,
            description: json.description,
            lastChangedAt: json.lastChangedAt,
            lastChangedBy: json.lastChangedBy
        });
    }
}