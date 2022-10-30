import { createConnection } from 'mysql';

const database = createConnection({
    user: process.env.DATABASE_I,
    password: process.env.DATABASE_P,
    database: process.env.DATABASE_D,
    host: process.env.DATABASE_H
});
database.connect((error) => {
    if (error) throw error;
});

export const query = <R = any>(search: string) => {
    return new Promise<R[]>((resolve, reject) => {
        database.query(search, (error, request) => {
            if (error) reject(error);
            else resolve(request);
        });
    });
};
