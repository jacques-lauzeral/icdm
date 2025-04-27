import { NamedEntity, NamedEntityData } from '../named-entity';

export interface FolderData extends NamedEntityData {
    // Add any Folder-specific properties here
}

export class Folder extends NamedEntity {
    constructor(data: FolderData = {}) {
        super(data);
    }

    // Folder-specific methods could go here

    static fromJSON(json: any): Folder {
        return new Folder({
            id: json.id,
            name: json.name,
            description: json.description,
            lastChangedAt: json.lastChangedAt,
            lastChangedBy: json.lastChangedBy
        });
    }
}