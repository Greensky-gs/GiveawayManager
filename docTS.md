# Documentation

Here is the documentation of [Greensky's Giveaways Manager](https://github.com/Greensky-gs/GiveawayManager) for a TypeScript usage

## Summary

| Content | Section |
| ------- | ------- |
| Initialisation | [initialisation part](#initialisation) |
| Customisation | [Customisation](#customisation) ([embeds](#customise-embeds) & [buttons](#customise-buttons)) |

## Initialisation

First, install dependencies with yarn (if you don't have yarn, run `npm i -g yarn` in a command prompt)

Install dependencies : `yarn install`

The manager is in [`./container/typescript`](./container/typescript/)

Once you got your files, write this to initiate the manager for MySQL

```ts
import { Client } from 'discord.js';
import { GiveawaysManager } from './GiveawayManager';
import { createConnection } from './mysql';

const client = new Client({
    intents: ['Guilds', 'GuildMessages', 'GuildMembers'],
    partials: ['MESSAGES', 'CHANNELS']
});

const db = createConnection({
    host: 'database host',
    username: 'database username',
    password: 'database password',
    database: 'database name'
})

const manager = new GiveawaysManager(client, {
    mode: 'mysql',
    connection: db,
    embeds: {
        // Optional embeds customisation
        // See the embed customisation part below
    },
    buttons: {
        // optional buttons customisation
        // See the button customisation part below
    },
    sendMessages: // Optionnal boolean option that trigger messages send (reroll and end messages)
});
manager.start();

client.GiveawaysManager = manager;

// This part is optional, it tells your code to add the manager definition in the client of Discord.JS for an easier usage of the manager
declare module 'discord.js' {
    interface Client {
        GiveawaysManager: GiveawaysManager;
    }
}
```

This is how to do it with JSON :

```ts
import { Client } from 'discord.js';
import { GiveawaysManager } from './GiveawayManager';

const client = new Client({
    intents: ['Guilds', 'GuildMessages', 'GuildMembers'],
    partials: ['MESSAGES', 'CHANNELS']
});


const manager = new GiveawaysManager(client, {
    mode: 'json',
    path: './thePathToTheJSONFile',
    embeds: {
        // Optional embeds customisation
        // See the embed customisation part below
    },
    buttons: {
        // optional buttons customisation
        // See the button customisation part below
    },
    sendMessages: // Optionnal boolean option that trigger messages send (reroll and end messages)
});
manager.start();

client.GiveawaysManager = manager;

// This part is optional, it tells your code to add the manager definition in the client of Discord.JS for an easier usage of the manager
declare module 'discord.js' {
    interface Client {
        GiveawaysManager: GiveawaysManager;
    }
}
```

Now you have your manager initialised on the client

## Customisation

You can customise embeds and buttons of the manager by adding a value in `embeds` and `buttons` fields in the [initialisation part](#initialisation)

### Customise embeds

### Customise buttons

When you initialise the 

## Methods

The manager has methods to use to manage giveaways

:warning: Remember that all methods have a description when you use it.

:warning: Almost all methods return a promise

If you want to see them, add the optional part in your TypeScript file

### Create a giveaway

Use the `createGiveaway()` method of the manager to create a giveaway

```ts
client.GiveawaysManager.createGiveaway({
    guild_id: 'GUILD ID',
    channel: a text channel,
    hoster_id: 'hoster id (person who started the giveaway)',
    reward: 'Reward of the giveaway',
    winnerCount: /* Amount of winners (as a number) */,
    time: /* Time in milliseconds of the giveaway */,
    // These 3 parameters are optional
    required_roles: ['ID required role 1', 'ID required role 2' /* ... */],
    denied_roles: ['ID denied role 1', 'ID denied role 2' /* ... */],
    bonus_roles: ['ID bonus role 1', 'ID bonus role 2' /* ... */],
})
```

#### Returns once created

Once the promise is finished, it resolves a [giveaway](#giveaway)

:warning: This promise can be **rejected**, so you have to use a `catch` block.

The promise is rejected when the message is not sent

### End a giveaway

Use the `endGiveaway()` method to end a giveaway

```ts
(async() => {
    // IMPORTANT
    // The await is necessary to get a value and not a promise
    // The parameter is only a message ID (specified in method description)
    const result = await client.GiveawaysManager.endGiveaway('giveaway message ID');
})()
```

#### Returns once ended

The promise is always resolved, the possible values are these :

* `no giveaway` (string) - giveaway not found (maybe the giveaway is ended)
* `no guild` (string) - Server not found
* `no channel` (string) - Channel not found
* `no message` (string) - giveaway message not found
* string[] - An array with winners ID - :warning: Be careful, the array can potentialy be empty

### Fetch a giveaway

Use the `fetchGiveaway()` method of the manager to get a giveaway

:warning: This method is not a promise

```ts
client.GiveawaysManager.fetchGiveaway(messsage.id);
client.GiveawaysManager.fetchGiveaway(message.guild.id, true);
client.GiveawaysManager.fetchGiveaway(message.mentions.channels.first(), false);
```

#### Fetch parameters

* input (string) - **required** : ID of the message, channel or server

> In case of channel or guild ID, it will return the last giveaway registered

* force (boolean) - **optional** - default `false` : Tells the method that you also want to check in the ended giveaways

#### Fetch returns

The method can return 2 values :

* `undefined` : When no giveaway is found
* [`a giveaway`](#giveaway) : giveaway data

### Reroll a giveaway

Use the `reroll()` method of the manager to reroll a giveaway

```ts
client.GiveawaysManager.reroll('Giveaway message ID');
```

#### Returns of a reroll

A reroll is always resolved ; the possible values are :

* `not ended` : giveaway not ended
* `no giveaway` : Giveaway not found
* `no guild` : server not found
* `no channel` : channel not found
* `no message` : message not found
* string[] - array : winners ID in an array ~ :warning: Be careful, the array can be empty

### Delete a giveaway

Use the `deleteGiveaway()` method of the manager to delete a giveaway

```ts
client.GiveawaysManager.deleteGiveaway('giveaway message ID');
```

#### Returns of a delete

Once the giveaway is deleted and erased from the database, it returns one of these values (promise always resolved) :

* `no giveaway` (string) - giveaway not found (maybe the giveaway is ended)
* `no guild` (string) - Server not found
* `no channel` (string) - Channel not found
* `no message` (string) - giveaway message not found
* [`a giveaway`](#giveaway) - Giveaway data

## Propreties

Here is the list of all propreties usable

### Client

`client` proprety of the manager is the client that you put when initialise the giveaway

### List

This proprety returns the current giveaways and the ended ones under JSON format (as an array of [giveaways](#giveaway))

```ts
const list = client.GiveawaysManager.list;
console.log(list);
// {
//    ended: giveaway[],
//    giveaways: giveaway[]
// }
```

### Map

`map` proprety returns the current giveaways and the ended ones as a map

```ts
const map = client.GiveawaysManager.map;
console.log(map);
// {
//     ended: Map<string, giveaway>,
//     giveaways: Map<string, giveaway>
// }
```

### Collection

`collection` proprety returns the current giveaways and ended ones as a Discord Collection

```ts
import { Collection } from 'discord.js';

const collection = new client.GiveawaysManager.collection;
console.log(collection);
// {
//     ended: Collection<string, giveaway>,
//     giveaways: Collection<string, giveaway>
// }
```

## Giveaway

The giveaway type is very often used, here is the list of the propreties that you can use :

```ts
export type giveaway = {
    guild_id: string; // Server ID
    channel_id: string; // Channel ID
    message_id: string; // Message ID
    hoster_id: string; // Hoster ID (person who started the giveaway)
    reward: string; // Reward of the giveaway
    winnerCount: number; // Winners count
    endsAt: number; // end date (as machine format [156456156464896])
    participants: string[]; // all participants IDs
    required_roles: string[]; // Required roles IDs
    denied_roles: string[]; // Denied roles IDs
    bonus_roles: string[]; // Bonus roles IDs
    winners: string[]; // Winners IDs (empty before being ended)
    ended: boolean; // If the giveaway is ended
};
```

## Useful informations

Here are some useful informations if you want to master the [giveaway manager](https://github.com/Greensky-gs/GiveawayManager) 🥷

### Bonus Roles

Bonus roles are roles that give 1 more entry per role if you have it
> Let's say that 10 persons who parcitipate to a giveaway</br>
> This giveaway has 1 bonus role</br>
> A person has THE bonus role</br>
> Consequently, this person has 2 chances out of 11 to win, and others one have 1 chance out of 11

### Required Roles

Required roles are roles to have if you want to participate to the giveaway

### Denied Roles

Denied roles are roles to not have if you want to participate to the giveaway

## Finished

Wow ! You read all the doc ! Congrats !

Don't forget, if you have any issue, problem or advise, open an [issue](https://github.com/Greensky-gs/GiveawayManager/issues/new) or contact me [on discord](https://discord.gg/fHyN5w84g6)
