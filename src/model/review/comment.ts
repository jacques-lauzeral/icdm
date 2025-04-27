export interface CommentData {
    id?: string;
    postedAt?: number;
    postedBy?: string;
    text?: string;
}

export class Comment {
    id: string | null;
    postedAt: number | null;
    postedBy: string | null;
    text: string;

    constructor(data: CommentData = {}) {
        this.id = data.id || null;
        this.postedAt = data.postedAt || null;
        this.postedBy = data.postedBy || null;
        this.text = data.text || '';
    }

    validate(): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.text || this.text.trim() === '') {
            errors.push('Comment text is required');
        }

        if (!this.postedBy) {
            errors.push('Comment author is required');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    toJSON(): object {
        return {
            id: this.id,
            postedAt: this.postedAt,
            postedBy: this.postedBy,
            text: this.text
        };
    }

    static fromJSON(json: any): Comment {
        return new Comment({
            id: json.id,
            postedAt: json.postedAt,
            postedBy: json.postedBy,
            text: json.text
        });
    }
}