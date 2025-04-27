import { NamedEntity, NamedEntityData } from '../named-entity';

export interface DataEntityData extends NamedEntityData {
    // Add any Data-specific properties here
}

export class Data extends NamedEntity {
    constructor(data: DataEntityData = {}) {
        super(data);
    }

    // Any Data-specific methods could go here

    static fromJSON(json: any): Data {
        return new Data({
            id: json.id,
            name: json.name,
            description: json.description,
            lastChangedAt: json.lastChangedAt,
            lastChangedBy: json.lastChangedBy
        });
    }
}