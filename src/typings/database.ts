import EasyJsonDB from 'easy-json-database';
import { Connection } from 'mysql';
import { Sequelize } from 'sequelize';
import mongoose from 'mongoose'

export type databaseMode = 'json' | 'mysql' | 'sequelize' | 'mongodb';

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
export type MongoDBDatabase = {
    mode: 'mongodb';
    connection: mongoose.Connection;
    modelName: string;
}

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
export type databaseOptionsMongoDB = {
    connection: mongoose.Connection;
    modelName: string;
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
    : Mode extends 'mongodb'
    ? databaseOptionsMongoDB
    : {});
export type Database<Mode extends databaseMode> = Mode extends 'json'
    ? JSONDatabase
    : Mode extends 'mysql'
    ? MySQLDatabase
    : Mode extends 'sequelize'
    ? SequelizeDatabase
    : Mode extends 'mongodb'
    ? MongoDBDatabase
    : never;
