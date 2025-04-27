import { BaseEntity, BaseEntityData } from '../base-entity';

export interface WaveData extends BaseEntityData {
    year?: number;
    quarter?: number;
    date?: string;
}

export class Wave extends BaseEntity {
    year: number | null;
    quarter: number | null;
    date: string | null;

    constructor(data: WaveData = {}) {
        super(data);
        this.year = data.year || null;
        this.quarter = data.quarter || null;
        this.date = data.date || null;
    }

    get name(): string | null {
        return this.year && this.quarter ? `${this.year}.${this.quarter}` : null;
    }

    validate(): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.year || this.year % 1 !== 0) {
            errors.push('Year must be a valid integer');
        }

        if (!this.quarter || this.quarter % 1 !== 0 || this.quarter < 1 || this.quarter > 4) {
            errors.push('Quarter must be a number between 1 and 4');
        }

        if (!this.date || !/^\d{4}\/\d{2}\/\d{2}$/.test(this.date)) {
            errors.push('Date must be in YYYY/MM/DD format');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    toJSON(): object {
        return {
            id: this.id,
            year: this.year,
            quarter: this.quarter,
            date: this.date,
            name: this.name,
            lastChangedAt: this.lastChangedAt,
            lastChangedBy: this.lastChangedBy
        };
    }

    static fromJSON(json: any): Wave {
        return new Wave({
            id: json.id,
            year: json.year,
            quarter: json.quarter,
            date: json.date,
            lastChangedAt: json.lastChangedAt,
            lastChangedBy: json.lastChangedBy
        });
    }
}