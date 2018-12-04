export class Variable {
    id: number;
    name: string;
    alias: string;
    unit: string;
    value: string;
    type: {
        signed: boolean,
        float: boolean,
        size: number
    };
    updatable: boolean;
}