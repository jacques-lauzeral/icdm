import { NamedEntity, NamedEntityData } from '../named-entity';

export interface ServiceData extends NamedEntityData {
    // Add any Service-specific properties here
}

export class Service extends NamedEntity {
    constructor(data: ServiceData = {}) {
        super(data);
    }

    // Any Service-specific methods could go here

    static fromJSON(json: any): Service {
        return new Service({
            id: json.id,
            name: json.name,
            description: json.description,
            lastChangedAt: json.lastChangedAt,
            lastChangedBy: json.lastChangedBy
        });
    }
}