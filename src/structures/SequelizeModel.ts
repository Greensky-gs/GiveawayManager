import { DataTypes, Model } from 'sequelize';

export class GiveawaysSequelizeModel extends Model {
    public message_id!: string;
    public channel_id!: string;
    public guild_id!: string;
    public reward!: string;
    public hoster_id!: string;

    public winnerCount!: number;
    public ends_at!: Date;

    public ended!: boolean;

    public required_roles!: string[];
    public denied_roles!: string[];
    public bonus_roles!: string[];

    public participants!: string[];
    public winners!: string[];
}

export const giveawaySequelizeAttributes = {
    guild_id: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    channel_id: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    message_id: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    hoster_id: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    reward: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    winnerCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    endsAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    participants: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [] as string[]
    },
    required_roles: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [] as string[]
    },
    denied_roles: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [] as string[]
    },
    bonus_roles: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [] as string[]
    },
    winners: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [] as string[]
    },
    ended: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
};
