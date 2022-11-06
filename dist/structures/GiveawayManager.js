"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiveawayManager = void 0;
const discord_js_1 = require("discord.js");
const embeds_1 = require("../assets/embeds");
const buttons_1 = require("../assets/buttons");
class GiveawayManager {
    constructor(client, db) {
        this.query = (search) => {
            return new Promise((resolve, reject) => {
                this.database.query(search, (error, request) => {
                    if (error)
                        reject(error);
                    else
                        resolve(request);
                });
            });
        };
        this.client = client;
        this.cache = new discord_js_1.Collection();
        this.ended = new discord_js_1.Collection();
        this.database = db;
    }
    /**
     * @description Get the list of all the giveaways in JSON format.
     * Use `map` to get it as a map, and `collection` to get it as a Discord collection
     */
    get list() {
        return {
            ended: this.ended.toJSON(),
            giveaways: this.cache.toJSON()
        };
    }
    /**
     * @description Get the list of all the giveaways in a map
     * Use `list` to get it as a JSON array, or `collection` to get it as a Discord collection
     */
    get map() {
        const ended = new Map();
        const giveaways = new Map();
        this.ended.forEach((x) => ended.set(x.message_id, x));
        this.cache.forEach((x) => giveaways.set(x.message_id, x));
        return { ended, giveaways };
    }
    /**
     * @description Get the list of all the giveaways in a Discord collection
     * Use `list` to get it as a JSON array, or `map` to get it as a map
     */
    get collection() {
        return {
            ended: this.ended,
            giveaways: this.cache
        };
    }
    start() {
        this.fillCache();
        setInterval(() => {
            this.cache
                .filter((x) => x.endsAt <= Date.now())
                .forEach((x) => {
                this.endGiveaway(x.message_id);
            });
        }, 15000);
        this.setOnInteraction();
    }
    /**
     * @description Create a giveaway in a server with the data that you specified
     * @param input Giveaway datas
     */
    createGiveaway(input) {
        return new Promise(async (resolve, reject) => {
            const embed = (0, embeds_1.giveaway)(input);
            const msg = await input.channel
                .send({
                embeds: [embed],
                components: [(0, buttons_1.getAsRow)([(0, buttons_1.participate)(), (0, buttons_1.cancelParticipation)()])]
            })
                .catch(() => { });
            if (!msg)
                return reject('No message');
            const data = {
                guild_id: input.channel.guild.id,
                channel_id: input.channel.id,
                message_id: msg.id,
                hoster_id: input.hoster_id,
                endsAt: input.time + Date.now(),
                ended: false,
                required_roles: input?.required_roles ?? [],
                denied_roles: input?.denied_roles ?? [],
                participants: [],
                bonus_roles: input?.bonus_roles ?? [],
                winners: [],
                winnerCount: input.winnerCount,
                reward: input.reward
            };
            this.cache.set(data.message_id, data);
            await this.query(this.makeQuery(data));
            resolve(data);
        });
    }
    /**
     * @description Use it to fetch a giveaway. You can use the message ID, the channel ID or the guild ID.
     * In the case of the channel ID, it will return the last launched giveaway in the channel.
     * In the case of the guild ID, it will return the last launched giveaway of the server
     * @param input The search you want to do. You can use message, channel or guild ID
     * @param force This parameter makes the function searching giveaways even the ended ones.
     * Default value is false
     */
    fetchGiveaway(input, force) {
        if (this.cache.has(input))
            return this.cache.get(input);
        const channel = this.cache.filter((x) => x.channel_id === input);
        if (channel.size > 0)
            return channel.last();
        const guild = this.cache.filter((x) => x.guild_id === input);
        if (guild.size > 0)
            return guild.last();
        if (force === true) {
            if (this.ended.has(input))
                return this.ended.get(input);
            const channel = this.ended.filter((x) => x.channel_id === input);
            if (channel.size > 0)
                return channel.last();
            const guild = this.ended.filter((x) => x.guild_id === input);
            if (guild.size > 0)
                return guild.last();
        }
        return undefined;
    }
    /**
     * @description End a giveaway and return an array with the winners
     * @param input ID of the message of the giveaway you want to end
     * You can use only the message ID
     * @returns The promise is always resolved.
     * Be aware, it can return an ampty array or string values
     */
    endGiveaway(input) {
        return new Promise(async (resolve) => {
            const gw = this.cache.get(input);
            if (!gw)
                return resolve('no giveaway');
            const guild = this.client.guilds.cache.get(gw.guild_id);
            if (!guild)
                return resolve('no guild');
            const channel = (await guild.channels.fetch(gw.channel_id));
            if (!channel)
                return resolve('no channel');
            await channel.messages.fetch();
            const message = channel.messages.cache.get(gw.message_id);
            if (!message)
                return resolve('no message');
            const winners = await this.roll(gw, guild);
            const embed = (0, embeds_1.ended)(gw, winners);
            gw.winners = winners;
            await message.edit({ embeds: [embed], components: [] }).catch((e) => {
                console.log(e);
            });
            await channel
                .send({ reply: { messageReference: message }, embeds: [(0, embeds_1.winners)(winners, this.getUrl(gw))] })
                .catch((e) => {
                console.log(e);
            });
            gw.ended = true;
            this.cache.delete(gw.message_id);
            this.ended.set(gw.message_id, gw);
            await this.query(this.makeQuery(gw, true));
            return resolve(winners);
        });
    }
    /**
     * @description Reroll a giveaway by it's ID and return an array with the new winners
     * @param input ID of the message of the giveaway you want to reroll
     * You can use only the message ID
     * @returns The promise is always resolved.
     * Be aware, it can return an empty array or string values
     */
    reroll(input) {
        return new Promise(async (resolve) => {
            let gw = this.ended.get(input);
            if (!gw && this.cache.has(input))
                return resolve('not ended');
            if (!gw)
                return resolve('no giveaway');
            const guild = this.client.guilds.cache.get(gw.guild_id);
            if (!guild)
                return resolve('no guild');
            const channel = guild.channels.cache.get(gw.channel_id);
            if (!channel)
                return resolve('no channel');
            await channel.messages.fetch();
            const message = channel.messages.cache.get(input);
            if (!message)
                return resolve('no message');
            let winners = await this.roll(gw, guild);
            gw.winners = winners;
            const embed = (0, embeds_1.ended)(gw, winners);
            await message.edit({ embeds: [embed] }).catch(() => { });
            await channel
                .send({ reply: { messageReference: message }, embeds: [(0, embeds_1.winners)(winners, this.getUrl(gw))] })
                .catch(() => { });
            let sql = this.makeQuery(gw, true);
            await this.query(sql);
            this.ended.set(input, gw);
            return resolve(winners);
        });
    }
    /**
     * @description Delete a giveaway. You can delete a finished or a current giveaway.
     * Suppress the message, erase it from the database and returns the values of the giveaway
     * @param input Message ID of the giveaway you want to delete.
     * You can use only the message ID
     * @returns Returns the values stored for the giveaway.
     */
    deleteGiveaway(input) {
        return new Promise(async (resolve) => {
            const gw = this.fetchGiveaway(input, true);
            if (!gw)
                return resolve('no giveaway');
            const guild = this.client.guilds.cache.get(gw.guild_id);
            if (!guild)
                return resolve('no guild');
            const channel = (await guild.channels.fetch(gw.channel_id));
            if (!channel)
                return resolve('no channel');
            await channel.messages.fetch();
            const message = channel.messages.cache.get(gw.message_id);
            if (!message)
                return resolve('no message');
            await message.delete().catch(() => { });
            this[this.cache.has(gw.message_id) ? 'cache' : 'ended'].delete(gw.message_id);
            await this.query(`DELETE FROM giveaways WHERE message_id='${gw.message_id}'`);
            return resolve(gw);
        });
    }
    registerParticipation(interaction) {
        const gw = this.cache.get(interaction.message.id);
        if (!gw)
            return interaction.deferUpdate();
        if (gw.participants.includes(interaction.user.id))
            return interaction
                .reply({
                embeds: [(0, embeds_1.alreadyParticipate)(this.getUrl(gw))],
                ephemeral: true
            })
                .catch(() => { });
        const mRoles = interaction.member.roles.cache;
        if (gw.required_roles.length > 0) {
            const missing = gw.required_roles.filter((x) => mRoles.has(x));
            if (missing.length < gw.required_roles.length)
                return interaction
                    .reply({
                    embeds: [(0, embeds_1.missingRequiredRoles)(missing, this.getUrl(gw))],
                    ephemeral: true
                })
                    .catch(() => { });
        }
        if (gw.denied_roles.length > 0) {
            const missing = mRoles
                .filter((x) => !gw.denied_roles.includes(x.id))
                .toJSON()
                .map((x) => x.id);
            if (missing.length < mRoles.size)
                return interaction
                    .reply({
                    embeds: [(0, embeds_1.hasDeniedRoles)(missing, this.getUrl(gw))],
                    ephemeral: true
                })
                    .catch(() => { });
        }
        gw.participants.push(interaction.user.id);
        interaction.message.edit({
            embeds: [
                (0, embeds_1.giveaway)({
                    bonus_roles: gw.bonus_roles,
                    required_roles: gw.required_roles,
                    denied_roles: gw.denied_roles,
                    channel: interaction.channel,
                    time: gw.endsAt - Date.now(),
                    hoster_id: gw.hoster_id,
                    reward: gw.reward,
                    winnerCount: gw.winnerCount,
                    guild_id: gw.guild_id
                })
            ]
        });
        this.cache.set(gw.message_id, gw);
        this.query(this.makeQuery(gw, true));
    }
    unregisterParticipation(interaction) {
        const gw = this.cache.get(interaction.message.id);
        if (!gw)
            return interaction.deferUpdate();
        if (!gw.participants.includes(interaction.user.id))
            return interaction
                .reply({
                embeds: [(0, embeds_1.notParticipated)(this.getUrl(gw))],
                ephemeral: true
            })
                .catch(() => { });
        gw.participants.splice(gw.participants.indexOf(interaction.user.id), 1);
        this.cache.set(gw.message_id, gw);
        this.query(this.makeQuery(gw, true));
        interaction
            .reply({
            embeds: [(0, embeds_1.removeParticipation)(this.getUrl(gw))],
            ephemeral: true
        })
            .catch(() => { });
    }
    setOnInteraction() {
        this.client.on('interactionCreate', (interaction) => {
            if (interaction.isButton() && interaction.guild) {
                if (interaction.customId === 'gw-participate') {
                    this.registerParticipation(interaction);
                }
                if (interaction.customId === 'gw-unparticipate') {
                    this.unregisterParticipation(interaction);
                }
            }
        });
    }
    getUrl({ guild_id, channel_id, message_id }) {
        return `https://discord.com/channels/${guild_id}/${channel_id}/${message_id}`;
    }
    async roll(gw, guild) {
        return new Promise(async (resolve) => {
            if (gw.participants.length == 0)
                return resolve([]);
            if (!guild)
                return resolve([]);
            let participants = [];
            for (const id of gw.participants) {
                const member = await guild.members.fetch(id);
                if (!member)
                    return;
                participants.push(id);
                if (gw.bonus_roles?.length > 0) {
                    for (const rId of gw.bonus_roles) {
                        if (member.roles.cache.has(rId))
                            participants.push(id);
                    }
                }
            }
            if (participants.length == 0)
                return resolve([]);
            let winners = [];
            const roll = () => {
                let winner = participants[Math.floor(Math.random() * participants.length)];
                if (winner) {
                    participants = participants.filter((x) => x !== winner);
                }
                return winner;
            };
            let i = 0;
            let end = false;
            while (end == false) {
                i++;
                let winner = roll();
                if (winner)
                    winners.push(winner);
                if (participants.length == 0 || i == gw.winnerCount)
                    end = true;
            }
            return resolve(winners);
        });
    }
    makeQuery(data, exists) {
        if (exists === true)
            return `UPDATE giveaways SET ${Object.keys(data)
                .map((k) => `${k}="${this.getValue(data[k])}"`)
                .join(', ')} WHERE message_id='${data.message_id}'`;
        return `INSERT INTO giveaways (${Object.keys(data)
            .map((k) => k)
            .join(', ')}) VALUES (${Object.keys(data)
            .map((k) => `"${this.getValue(data[k])}"`)
            .join(', ')})`;
    }
    getValue(x) {
        if (typeof x === 'string')
            return x.replace(/"/g, '\\"');
        return JSON.stringify(x);
    }
    toObj(x) {
        let gw = x;
        ['participants', 'required_roles', 'winners', 'denied_roles', 'bonus_roles'].forEach((v) => {
            gw[v] = JSON.parse(x[v]);
        });
        return gw;
    }
    async fillCache() {
        const gws = await this.query('SELECT * FROM giveaways');
        for (const gw of gws) {
            this.cache.set(gw.message_id, this.toObj(gw));
        }
    }
}
exports.GiveawayManager = GiveawayManager;
