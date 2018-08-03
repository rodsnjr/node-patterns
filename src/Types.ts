export const TYPES = {
    Service: Symbol.for('Service'),
    Repository: Symbol.for('Repository'),
    Controller: Symbol.for('Controller'),
    MongoDB: Symbol.for('MongoDB'),
    Validator: Symbol.for('Validator'),
}

export interface Response<T> {
    status: number,
    body?: T
}