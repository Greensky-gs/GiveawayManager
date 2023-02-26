import { ButtonBuilder, ButtonInteraction, Client, Collection, Guild, Message, TextChannel } from 'discord.js';
import { giveaway as gwT, giveawayInput, gwSql } from '../typings/giveaway';
import * as embeds from '../assets/embeds';
import * as buttons from '../assets/buttons';
import { Connection } from 'mysql';
import { embedsInputData } from '../typings/embeds';
import { buttonsInputData } from '../typings/buttons';
import { Database, JSONDatabase, ManagerEvents, ManagerListeners, MySQLDatabase, databaseMode, databaseOptions } from '../typings/managerEvents';
import EasyJsonDB from 'easy-json-database';
import { writeFileSync } from 'fs';

export class GiveawayManager<DatabaseMode extends databaseMode> {
    public readonly client: Client;
    private embeds: embedsInputData = embeds;
    private buttons: buttonsInputData = buttons;
    private listeners: ManagerListeners<keyof ManagerEvents>[] = [];
    private sendMessages: boolean = true;

    public database: Database<DatabaseMode>;
    private cache: Collection<string, gwT>;
    private ended: Collection<string, gwT>;
    private mode: DatabaseMode;

    constructor(
        client: Client,
        database: databaseOptions<DatabaseMode>,
        options?: {
            embeds?: embedsInputData;
            buttons?: buttonsInputData;
            sendMessages?: boolean;
        },
    ) {
        this.client = client;
        this.cache = new Collection();

        this.ended = new Collection();
        if (database.mode === 'json') {
            const opts = database as { path: `./${string}`, mode: 'json' };
            (this.database as JSONDatabase) = {
                file: new EasyJsonDB(opts.path),
                mode: 'json',
                path: opts.path
            }
        } else if (database.mode === 'mysql') {
            const opts = database as { mode: 'mysql', connection: Connection };
            (this.database as MySQLDatabase) = {
                mode: 'mysql',
                connection: opts.connection
            }
        }
        this.mode = database.mode;

        this.embeds = options?.embeds ? Object.assign(this.embeds, options.embeds) : this.embeds;
        this.buttons = options?.buttons ? Object.assign(this.buttons, options.buttons) : this.buttons;
        this.sendMessages = ![null, undefined].includes(options?.sendMessages) ? options.sendMessages : this.sendMessages;

        if (this.database.mode === 'json') {
            if (!this.database.file.get('giveaways')) this.database.file.set('giveaways', []);
        }
    }
    /**
     * @description Get the list of all the giveaways in JSON format.
     * Use `map` to get it as a map, and `collection` to get it as a Discord collection
     */
    public get list() {
        return {
            ended: this.ended.toJSON(),
            giveaways: this.cache.toJSON()
        };
    }
    /**
     * @description Get the list of all the giveaways in a map
     * Use `list` to get it as a JSON array, or `collection` to get it as a Discord collection
     */
    public get map() {
        const ended = new Map<string, gwT>();
        const giveaways = new Map<string, gwT>();

        this.ended.forEach((x) => ended.set(x.message_id, x));
        this.cache.forEach((x) => giveaways.set(x.message_id, x));
        return { ended, giveaways };
    }
    /**
     * @description Get the list of all the giveaways in a Discord collection
     * Use `list` to get it as a JSON array, or `map` to get it as a map
     */
    public get collection() {
        return {
            ended: this.ended,
            giveaways: this.cache
        };
    }
    public on<K extends keyof ManagerEvents>(event: K, run: (...args: ManagerEvents[K]) => void | unknown) {
        this.listeners.push({
            event,
            run
        } as ManagerListeners<keyof ManagerEvents>);
    }
    private emit<Key extends keyof ManagerEvents>(event: Key, ...args: ManagerEvents[Key]) {
        const listeners = this.listeners.filter(x => x.event === event);
        listeners.forEach((l) => {
            (l.run as (...args: unknown[]) => void | unknown)(...args);
        })
    }
    public async start() {
        await this.query(
            `CREATE TABLE IF NOT EXISTS giveaways ( guild_id TEXT(255) NOT NULL, channel_id TEXT(255) NOT NULL, message_id TEXT(255) NOT NULL, hoster_id TEXT(255) NOT NULL, reward TEXT(255) NOT NULL, winnerCount INTEGER(255) NOT NULL DEFAULT "1", endsAt VARCHAR(1024) NOT NULL, participants LONGTEXT, required_roles LONGTEXT, denied_roles LONGTEXT, bonus_roles LONGTEXT, winners LONGTEXT, ended TINYINT(1) NOT NULL DEFAULT "0" );`
        );
        if (this.mode === 'json') {
            if (!(this.database as JSONDatabase).file.get('giveaways')) (this.database as JSONDatabase).file.set('giveaways', []);
        }
        this.fillCache();
        setInterval(() => {
            this.cache
                .filter((x) => x.endsAt <= Date.now() && !x.ended)
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
    public createGiveaway(input: giveawayInput): Promise<gwT> {
        return new Promise(async (resolve, reject) => {
            const embed = this.embeds.giveaway(input);

            const msg = await input.channel
                .send({
                    embeds: [embed],
                    components: [
                        buttons.getAsRow<ButtonBuilder>([
                            this.buttons.participate(),
                            this.buttons.cancelParticipation()
                        ])
                    ]
                })
                .catch(() => {});
            if (!msg) return reject('No message');

            const data: gwT = {
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
            this.insertGiveaway(data);

            this.client.emit('giveawayStarted', data, input.channel, input.hoster_id)
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
    public fetchGiveaway(input: string, force?: boolean): gwT | undefined {
        if (this.cache.has(input)) return this.cache.get(input);
        const channel = this.cache.filter((x) => x.channel_id === input);
        if (channel.size > 0) return channel.last();
        const guild = this.cache.filter((x) => x.guild_id === input);
        if (guild.size > 0) return guild.last();

        if (force === true) {
            if (this.ended.has(input)) return this.ended.get(input);
            const channel = this.ended.filter((x) => x.channel_id === input);
            if (channel.size > 0) return channel.last();
            const guild = this.ended.filter((x) => x.guild_id === input);
            if (guild.size > 0) return guild.last();
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
    public endGiveaway(input: string): Promise<string[] | 'no giveaway' | 'no guild' | 'no channel' | 'no message'> {
        return new Promise(async (resolve) => {
            const gw = this.cache.get(input);
            if (!gw) return resolve('no giveaway');

            const guild = this.client.guilds.cache.get(gw.guild_id);
            if (!guild) return resolve('no guild');

            const channel = (await guild.channels.fetch(gw.channel_id)) as TextChannel;
            if (!channel) return resolve('no channel');

            await channel.messages.fetch();
            const message = channel.messages.cache.get(gw.message_id) as Message<true>;
            if (!message) return resolve('no message');

            const winners = await this.roll(gw, guild);
            const embed = this.embeds.ended(gw, winners);

            gw.winners = winners;
            await message.edit({ embeds: [embed], components: [] }).catch((e) => {
                console.log(e);
            });
            const em =
                gw.winners.length === 0
                    ? this.embeds.noEntries(this.getUrl(gw))
                    : this.embeds.winners(winners, this.getUrl(gw));
            if (this.sendMessages) await channel.send({ reply: { messageReference: message }, embeds: [em] }).catch((e) => {
                console.log(e);
            });
            gw.ended = true;

            this.cache.delete(gw.message_id);
            this.ended.set(gw.message_id, gw);
            this.updateGiveaway(gw.message_id, gw);

            this.client.emit('giveawayEnded', gw, channel, winners);
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
    public reroll(
        input: string
    ): Promise<string[] | 'not ended' | 'no giveaway' | 'no guild' | 'no channel' | 'no message'> {
        return new Promise(async (resolve) => {
            let gw = this.ended.get(input);
            if (!gw && this.cache.has(input)) return resolve('not ended');
            if (!gw) return resolve('no giveaway');

            const guild = this.client.guilds.cache.get(gw.guild_id);
            if (!guild) return resolve('no guild');

            const channel = guild.channels.cache.get(gw.channel_id) as TextChannel;
            if (!channel) return resolve('no channel');

            await channel.messages.fetch();
            const message = channel.messages.cache.get(input);
            if (!message) return resolve('no message');

            let old = gw.winners ?? [];
            let winners = await this.roll(gw, guild);

            gw.winners = winners;
            const embed = this.embeds.ended(gw, winners);

            await message.edit({ embeds: [embed] }).catch(() => {});
            const em =
                gw.winners.length === 0
                    ? this.embeds.noEntries(this.getUrl(gw))
                    : this.embeds.winners(winners, this.getUrl(gw));
            if (this.sendMessages) await channel.send({ reply: { messageReference: message }, embeds: [em] }).catch(() => {});

            this.updateGiveaway(gw.message_id, gw);

            this.ended.set(input, gw);

            this.client.emit('giveawayRerolled', gw, channel, old, winners);
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
    public deleteGiveaway(input: string): Promise<gwT | 'no giveaway' | 'no guild' | 'no channel' | 'no message'> {
        return new Promise(async (resolve) => {
            const gw = this.fetchGiveaway(input, true);
            if (!gw) return resolve('no giveaway');

            const guild = this.client.guilds.cache.get(gw.guild_id);
            if (!guild) return resolve('no guild');

            const channel = (await guild.channels.fetch(gw.channel_id)) as TextChannel;
            if (!channel) return resolve('no channel');

            await channel.messages.fetch();
            const message = channel.messages.cache.get(gw.message_id);
            if (!message) return resolve('no message');

            await message.delete().catch(() => {});
            this[this.cache.has(gw.message_id) ? 'cache' : 'ended'].delete(gw.message_id);

            this.deleteGwDb(gw.message_id);
            return resolve(gw);
        });
    }
    private registerParticipation(interaction: ButtonInteraction<'cached'>) {
        const gw = this.cache.get(interaction.message.id);
        if (!gw) return interaction.deferUpdate();

        if (gw.participants.includes(interaction.user.id))
            return interaction
                .reply({
                    embeds: [this.embeds.alreadyParticipate(this.getUrl(gw))],
                    ephemeral: true
                })
                .catch(() => {});
        const mRoles = interaction.member.roles.cache;
        if (gw.required_roles.length > 0) {
            const missing: string[] = gw.required_roles.filter((x) => mRoles.has(x));
            if (missing.length < gw.required_roles.length)
                return interaction
                    .reply({
                        embeds: [this.embeds.missingRequiredRoles(missing, this.getUrl(gw))],
                        ephemeral: true
                    })
                    .catch(() => {});
        }
        if (gw.denied_roles.length > 0) {
            const missing: string[] = mRoles
                .filter((x) => !gw.denied_roles.includes(x.id))
                .toJSON()
                .map((x) => x.id);
            if (missing.length < mRoles.size)
                return interaction
                    .reply({
                        embeds: [this.embeds.hasDeniedRoles(missing, this.getUrl(gw))],
                        ephemeral: true
                    })
                    .catch(() => {});
        }
        gw.participants.push(interaction.user.id);
        interaction.message.edit({
            embeds: [
                this.embeds.giveaway({
                    bonus_roles: gw.bonus_roles,
                    required_roles: gw.required_roles,
                    denied_roles: gw.denied_roles,
                    channel: interaction.channel as TextChannel,
                    time: gw.endsAt - Date.now(),
                    hoster_id: gw.hoster_id,
                    reward: gw.reward,
                    winnerCount: gw.winnerCount,
                    guild_id: gw.guild_id,
                    participants: gw.participants
                })
            ]
        });
        interaction
            .reply({ embeds: [this.embeds.participationRegistered(this.getUrl(gw))], ephemeral: true })
            .catch(() => {});
        this.cache.set(gw.message_id, gw);
        this.updateGiveaway(gw.message_id, gw);
    }
    private unregisterParticipation(interaction: ButtonInteraction<'cached'>) {
        const gw = this.cache.get(interaction.message.id);
        if (!gw) return interaction.deferUpdate();

        if (!gw.participants.includes(interaction.user.id))
            return interaction
                .reply({
                    embeds: [this.embeds.notParticipated(this.getUrl(gw))],
                    ephemeral: true
                })
                .catch(() => {});

        gw.participants = gw.participants.filter((x) => x !== interaction.user.id);
        this.cache.set(gw.message_id, gw);
        this.updateGiveaway(gw.message_id, gw);

        interaction
            .reply({
                embeds: [this.embeds.removeParticipation(this.getUrl(gw))],
                ephemeral: true
            })
            .catch(() => {});
        interaction.message
            .edit({
                embeds: [
                    this.embeds.giveaway({
                        bonus_roles: gw.bonus_roles,
                        required_roles: gw.required_roles,
                        denied_roles: gw.denied_roles,
                        channel: interaction.channel as TextChannel,
                        time: gw.endsAt - Date.now(),
                        hoster_id: gw.hoster_id,
                        reward: gw.reward,
                        winnerCount: gw.winnerCount,
                        guild_id: gw.guild_id,
                        participants: gw.participants
                    })
                ]
            })
            .catch(() => {});
    }
    private setOnInteraction() {
        this.client.on('interactionCreate', (interaction) => {
            if (interaction.isButton() && interaction.guild) {
                if (interaction.customId === 'gw-participate') {
                    this.registerParticipation(interaction as ButtonInteraction<'cached'>);
                }
                if (interaction.customId === 'gw-unparticipate') {
                    this.unregisterParticipation(interaction as ButtonInteraction<'cached'>);
                }
            }
        });
    }
    private getUrl({ guild_id, channel_id, message_id }: { guild_id: string; channel_id: string; message_id: string }) {
        return `https://discord.com/channels/${guild_id}/${channel_id}/${message_id}`;
    }
    private async roll(gw: gwT, guild: Guild): Promise<string[]> {
        return new Promise(async (resolve) => {
            if (gw.participants.length === 0) return resolve([]);
            if (!guild) return resolve([]);
            let participants: string[] = [];

            for (const id of gw.participants) {
                const member = await guild.members.fetch(id);
                if (!member) return;

                participants.push(id);
                if (gw.bonus_roles?.length > 0) {
                    for (const rId of gw.bonus_roles) {
                        if (member.roles.cache.has(rId)) participants.push(id);
                    }
                }
            }

            if (participants.length == 0) return resolve([]);

            let winners: string[] = [];
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

                if (winner) winners.push(winner);
                if (participants.length == 0 || i == gw.winnerCount) end = true;
            }

            return resolve(winners);
        });
    }
    private makeQuery(data: any, exists?: boolean) {
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
    private getValue(x: string | string[] | boolean): string {
        if (typeof x === 'boolean') return x ? '1' : '0';
        if (typeof x === 'string') return x.replace(/"/g, '\\"');
        return JSON.stringify(x).replace(/"/g, '\\"');
    }
    private toObj(x: any) {
        let gw: any = x;
        ['participants', 'required_roles', 'winners', 'denied_roles', 'bonus_roles'].forEach((v) => {
            gw[v] = JSON.parse(x[v]);
        });
        gw.ended = gw.ended === 1;

        return gw;
    }
    private async fillCache() {
        const gws = await this.getDbGiveaways();

        for (const gw of gws) {
            const g = this.mode === 'json' ? gw : this.toObj(gw);
            if (g.ended === true) this.ended.set(g.message_id, g);
            else this.cache.set(g.message_id, g);
        }
    }
    private databaseQuery<R = any>(sql: string): Promise<R[]> {
        return new Promise((resolve, reject) => {
            (this.database as MySQLDatabase).connection.query(sql, (error: any, request: R[]) => {
                if (error) return reject(error);
                return resolve(request);
            })
        })
    }
    private async getDbGiveaways(): Promise<gwT[]> {
        if (this.mode === 'mysql') {
            return await this.databaseQuery<gwT>(`SELECT * FROM giveaways`)
        } else {
            return (this.database as JSONDatabase).file.get('giveaways') as gwT[];
        }
    }
    private query = <R = any>(search: string) => {
        if (this.mode === 'mysql') {
            return new Promise<R[]>((resolve, reject) => {
                (this.database as databaseOptions<'mysql'>).connection.query(search, (error: any, request: R[]) => {
                    if (error) reject(error);
                    else resolve(request);
                });
            });
        }
    };
    private updateGiveaway(message_id: string, data: gwT) {
        if (data.message_id !== message_id) {
            throw new Error('Critical: message_id and data.message_id are different. This should never appears, please contact the developper');
        }
        if (this.mode === 'json') {
            const array = (this.database as JSONDatabase).file.get('giveaways') as gwT[];
            const index = array.indexOf(array.find(x => x.message_id === message_id))

            array[index] = data;
            (this.database as JSONDatabase).file.set('giveaways', array);
        } else {
            this.query(this.makeQuery(data, true));
        }
    }
    private insertGiveaway(data: gwT) {
        if (this.mode === 'json') {
            const array = (this.database as JSONDatabase).file.get('giveaways') as gwT[];
            array.push(data);

            (this.database as JSONDatabase).file.set('giveaways', array);
        } else {
            this.query(this.makeQuery(data, false));
        }
    }
    private deleteGwDb(message_id: string) {
        if (this.mode === 'json') {
            const array = (this.database as JSONDatabase).file.get('giveaways') as gwT[];
            array.splice(array.indexOf(array.find(x => x.message_id === message_id)), 1);

            (this.database as JSONDatabase).file.set('giveaways', array);
        } else {
            this.query(`DELETE FROM giveaways WHERE message_id='${message_id}'`);
        }
    }
}
