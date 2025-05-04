import EasyJsonDB from 'easy-json-database';
import { Connection } from 'mysql';
import { Sequelize } from 'sequelize';

export type databaseMode = 'json' | 'mysql' | 'sequelize';

// Databases types
export type MySQLDatabase = {
    mode: 'mysql';
    connection: Connection;
};
export type JSONDatabase = {
    mode: 'json';
    path: `./${string}`;
    file: EasyJsonDB;
};
export type SequelizeDatabase = {
    mode: 'sequelize';
    sequelize: Sequelize;
    tableName: string;
};

// Database options
export type databaseOptionsSequelize = {
    sequelize: Sequelize;
    tableName: string;
};
export type databaseOptionsMySQL = {
    connection: Connection;
};
export type databaseOptionsJSON = {
    path: `./${string}`;
};

// Database options type
export type databaseOptions<Mode extends databaseMode> = {
    mode: Mode;
} & (Mode extends 'json'
    ? databaseOptionsJSON
    : Mode extends 'mysql'
    ? databaseOptionsMySQL
    : Mode extends 'sequelize'
    ? databaseOptionsSequelize
    : {});
export type Database<Mode extends databaseMode> = Mode extends 'json' ? JSONDatabase : Mode extends 'mysql' ? MySQLDatabase : Mode extends 'sequelize' ? SequelizeDatabase : never;
