export interface UserData {
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
}

export class User {
    id: string | null;
    email: string;
    firstName: string;
    lastName: string;

    constructor(data: UserData = {}) {
        this.id = data.id || null;
        this.email = data.email || '';
        this.firstName = data.firstName || '';
        this.lastName = data.lastName || '';
    }

    validate(): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
            errors.push('Valid email is required');
        }

        if (!this.firstName || this.firstName.trim() === '') {
            errors.push('First name is required');
        }

        if (!this.lastName || this.lastName.trim() === '') {
            errors.push('Last name is required');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    toJSON(): object {
        return {
            id: this.id,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            fullName: this.fullName
        };
    }

    static fromJSON(json: any): User {
        return new User({
            id: json.id,
            email: json.email,
            firstName: json.firstName,
            lastName: json.lastName
        });
    }
}