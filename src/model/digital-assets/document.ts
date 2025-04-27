import { BaseEntity, BaseEntityData } from '../base-entity';

export interface DocumentData extends BaseEntityData {
    name?: string;
    description?: string;
    mimeType?: string;
    size?: number;
    uploadedAt?: number;
    uploadedBy?: string;
    path?: string;
}

export class Document extends BaseEntity {
    name: string;
    description: string;
    mimeType: string;
    size: number;
    uploadedAt: number | null;
    uploadedBy: string | null;
    path: string;

    constructor(data: DocumentData = {}) {
        super(data);
        this.name = data.name || '';
        this.description = data.description || '';
        this.mimeType = data.mimeType || '';
        this.size = data.size || 0;
        this.uploadedAt = data.uploadedAt || null;
        this.uploadedBy = data.uploadedBy || null;
        this.path = data.path || '';
    }

    validate(): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.name || this.name.trim() === '') {
            errors.push('Name is required');
        }

        if (!this.mimeType || this.mimeType.trim() === '') {
            errors.push('MIME type is required');
        }

        if (this.size % 1 !== 0 || this.size <= 0) {
            errors.push('Size must be a positive integer');
        }

        if (!this.path || this.path.trim() === '') {
            errors.push('Path is required');
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
            mimeType: this.mimeType,
            size: this.size,
            uploadedAt: this.uploadedAt,
            uploadedBy: this.uploadedBy,
            path: this.path
        };
    }

    static fromJSON(json: any): Document {
        return new Document({
            id: json.id,
            name: json.name,
            description: json.description,
            mimeType: json.mimeType,
            size: json.size,
            uploadedAt: json.uploadedAt,
            uploadedBy: json.uploadedBy,
            path: json.path,
            lastChangedAt: json.lastChangedAt,
            lastChangedBy: json.lastChangedBy
        });
    }
}