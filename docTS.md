# Documentation

Here is the documentation of [Greensky's Giveaways Manager](https://github.com/Greensky-gs/GiveawayManager) for a TypeScript usage

## Summary

| Content | Section |
| ------- | ------- |
| Initialisation | [initialisation part](#initialisation) ([MySQL](#mysql-initialisation) & [JSON](#json-initialisation)) |
| Customisation | [Customisation](#customisation) ([embeds](#customise-embeds), [buttons](#customise-buttons) & [sendMessages](#sendmessages-option)) |
| Methods | [list of methods](#methods) |
| Types | [List of types](#types) |
| Examples | [See examples](#examples) |

## Initialisation

Install the manager using the command `npm install discordjs-giveaways`

Then, you can initiate two different ways, with a [JSON initialisation](#json-initialisation), or with a [MySQL initialisation](#mysql-initialisation)

### JSON initialisation

If you want to use the manager with a JSON storage, use it like so :

```ts
// Imports
import { GiveawayManager } from 'discordjs-giveaways';
import { Client, Partials } from 'discord.js';

// Create client and manager
const client = new Client({
    intents: ['Guilds'],
    partials: [Partials.Message, Partials.Channel]
});

const manager = new GiveawayManager(client, {
    mode: 'json',
    path: './giveaways.json'
});

// Start manager
manager.start();
```

If you want to customise buttons, and embeds, you can see the [customisation part](#customisation)

### MySQL initialisation

If you want to use the manager with a [MySQL](https://www.npmjs.com/package/mysql) database, you first need to install [MySQL](https://www.npmjs.com/package/mysql) (if it isn't done, use `npm install mysql @types/mysql`)

Then, import the manager, the client and the database and create the manager

```ts
// Imports
import { GiveawayManager } from 'discord.js-giveaways';
import { Client, Partials } from 'discord.js';
import { createConnection } from 'mysql';

// Create Client and MySQL connection
const client = new Client({
    intents: ['Guilds'],
    partials: [Partials.Message, Partials.Channel]
});
const database = createConnection({
    user: 'database user',
    password: 'database password',
    database: 'database name',
    host: 'database host'
});

// Create manager
const manager = new GiveawayManager(client, {
    mode: 'mysql',
    connection: database
});

// Start manager

manager.start();
```

If you want to customise the embeds and the buttons, see the [customisation part](#customisation)

## Customisation

You may want to change the embeds when you use the manager

The fields `embeds` and `buttons` are made for this in the options parameter of the manager

You also can toggle the send of a message when a giveaway ends/reroll by activating the [SendMessages option](#sendmessages-option)

### Customise embeds

If you want to customise embeds, use the `embeds` field in the `options` parameter of the manager

```ts
const databaseConfig = 'Your database configuration';
const manager = new GiveawayManager(
    client,
    databaseConfig,
    // Options
    {
        embeds: {
            // Put all your embeds here
        }
    }
)
```

#### Keys

The keys to put in the `embeds` field are very precise for the manager to work. Here is how to use them

They are functions that returns embed.
For instance :

```ts
const winners = (winners: string[], data: giveaway, url: string) => {
    // Returns an embed
    return new EmbedBuilder()
        .setTitle("Winner")
        .setDescription(`Congrats ${winners.map(x => `<@${x}>`).join(' ')}! You won ${data.reward} !`)
        .setURL(url)
        .setColor('Yellow')
}
```

| Embed name | Usage | Reference |
| ---------- | ----- | --------- |
| `giveaway` | Used on the creation of the giveaway | [usage](#giveaway-embed) |
| `ended` | Used on the giveaway message, when the giveaway is ended | [usage](#giveaway-ended-embed) |
| `hasDeniedRoles` | Reply to the user when user one of denied roles | [usage](#denied-roles-embed)
| `missingRrequiredRoles` | Reply to the user when user doesn't have one of the required roles to participate | [usage](#required-roles-embed) |
| `entryAllowed` | ~~Used to say to the user that his participation has been validated and registered~~ | [usage](#entry-allowed-embed) ⚠️ ~~deprecated~~ |
| `alreadyParticipate` | Reply to the user to say that he already participated to the giveaway | [usage](#already-participate-embed) |
| `notParticipated` | Reply to the user to say that he doesn't participate to the giveaway, so he can't unparticipate | [usage](#not-participated-embed) |
| `removeParticipation` | Reply to the user to say that his participation has been removed | [usage](#remove-participation-embed) |
| `winners` | Reply to the channel when the giveaway is over/rerolled, that at least one winner can be determined and the [sendMessage option](#sendmessages-option) is enabled | [usage](#winners-embed) |
| `noEntries` | Reply to the channel when the giveaway is over/rerolled, that no winner can be determined and the [sendMessage option](#sendmessages-option) is enabled | [usage](#sendmessages-option) |
| `particpationRegistered` | Reply to the user to say that his participation has been validated and registered | [usage](#participation-registered-embed) |

> All these keys are optional, you can put one of them or all of them

##### Giveaway embed

The most complex one, it takes an argument of [giveaway type](#giveaway-type) **and** the list of all participants (empty array when it starts)

You can use it like so

```ts
export const giveaway = (data: giveaway & { participants: string[] }) => {
    // Returns an embed
    return new EmbedBuilder()
        .setTitle(`Giveaway`)
        .setDescription(`Giveaway hosted by <@${data.hoster_id}> ! Click on the button to try to win **${data.reward}**\nEnds <t:${Math.floor(data.endsAt / 1000)}:F>\n\n**${participants.length}** entries`)
        .setColor(data.endsAt - Date.now() < 10000 ? '#ff0000' : '#00ff00')
        .setTimestamp(new Date(data.endsAt))
}
```

> Note: the `<t:${Math.floor(data.endsAt / 1000)}:F>` will display a timestamp on Discord like `in 1 hour`<br>
> This line `.setColor(data.endsAt - Date.now() < 10000 ? '#ff0000' : '#00ff00')` will make the embed red if the giveaway ends in less than 10 seconds

##### Giveaway ended embed

This is the embed replacing the [giveaway embed](#giveaway-embed) once the giveaway is over

This embed takes a [giveaway](#giveaway-type) and an array of strings, representing the identifiers of winners, as arguments

```ts
const ended = (data: giveaway, winners: string[]) => {
    // Returns an embed
    return new EmbedBuilder()
        .setTitle("Giveaway ended")
        .setDescription(`This giveaway is ended.\n${data.reward}\nWinners: ${data.winners.length > 0 ? data.winners.map(w => `<@${w}>`).join(' ') : 'No winner'}`)
        .setTimestamp()
        .setColor('#ff0000')
}
```

##### denied roles embed

This is the embed replied as ephemeral when the user tries to participate to a giveaway with one of the denied roles

The parameters are an array of strings, representing the identifiers of roles, and a string, wich is the URL to the giveaway

```ts
export const hasDeniedRoles = (deniedRoles: string[], url: string) => {
    // Returns an embed
    return new EmbedBuilder()
        .setTitle("Denied roles")
        .setDescription(`Your participation to [**this giveaway**](${url}) has been rejected, because you have one of the denied roles of the giveaway (you got ${deniedRoles.map(r => `<@&${r}>`).join(' ')})`)
        .setColor('#ff0000')
}
```

##### required roles embed

This is the embed replied as ephemeral when the user tries to participate without having all the required roles

The parameters are an array of strings, representing the identifiers of missing roles, and a string, wich is the URL to the giveaway

```ts
export const missingRequriedRoles = (requiredRoles: string[], url: string) => {
    // Returns an embed
    return new EmbedBuilder()
        .setTitle("Required roles")
        .setDescription(`Your participation to [**this giveaway**](${url}) has been rejected, because you don't have all the required roles of the giveaway (you miss ${deniedRoles.map(r => `<@&${r}>`).join(' ')})`)
        .setColor('#ff0000')
}
```

##### entry allowed embed

⚠️ This embed is **deprecated**, use the [participation registered embed](#participation-registered-embed) instead

##### already participate embed

This is the embed replied as ephemeral when the user hits the `Participate` button when he already participates to the giveaway

The parameter is the URL to the giveaway

```ts
export const alreadyParticipate = (url: string) => {
    // Returns an embed
    return new EmbedBuilder()
        .setTitle('Already participated')
        .setDescription(`You already participate to [**this giveaway**](${url}).`)
        .setColor('#ff0000');
}
```

##### not participated embed

This is the embed replied as ephemeral when the user hits the `Unparticipate` button whithout participating to the giveaway

The parameter is the URL to the giveaway

```ts
export const notParticipated = (url: string) => {
    // Returns an embed
    return new EmbedBuilder()
        .setTitle('Not participed')
        .setDescription(`You have not participated to [**this giveaway**](${url})`)
        .setColor('#ff0000');
}
```

##### remove participation embed

This is the embed replied as ephemeral to the user when he successfully remove his participation after clicking on the `Unparticipate button`

The parameter is the URL to the giveaway

```ts
export const removeParticipation = (url: string) => {
    // Returns an embed
    return new EmbedBuilder()
        .setTitle('Entry removed')
        .setDescription(`I removed your entry to [**this giveaway**](${url}).`)
        .setColor('#00ff00')
}
```

##### winners embed

This is the embed sent in the channel when :

1. The giveaway is over
2. At least one winner can be determined
3. The [sendMessages option](#sendmessages-option) is enabled

The parameters are :

1. An array of strings (identifiers of winners)
2. the [giveaway](#giveaway-type)
3. The URL to the giveaway

```ts
export const winners = (winners: string[], gw: giveaway, url: string) => {
    // Returns an embed
    return new EmbedBuilder()
        .setTitle("Winners")
        .setDescription(`Congrats ${winners.map(w => `<@${w}>`).join(' ')}! You won ${gw.reward} !`)
        .setColor('#ff0000')
        .setURL(url)
}
```

##### No entries embed

This is the embed sent in the channel when :

1. The giveaway is over
2. At least one winner can be determined
3. The [sendMessages option](#sendmessages-option) is enabled

The only parameter is the URL to the giveaway

```ts
export const noEntries = (url: string) => {
    // Returns an embed
    return new EmbedBuilder()
        .setTitle('No winner')
        .setDescription(`No winner can be found for [**this giveaway**](${url})`)
        .setColor('#ff0000');
};
```

##### Participation registered embed

This is the embed replied to the user when his participation is successfully registered

The parameter is the URL to the giveaway

```ts
export const participationRegistered = (url: string) => {
    // Returns an embed
    return new EmbedBuilder()
        .setTitle("Participation registered")
        .setColor('#00ff00')
        .setDesscription(`Your participation to [**this giveaway**](${url}) has been registered`)
}
```

### Customise buttons

If you want to customise buttons of the, you can do it by adding functions in the `buttons` field of the options of the manager

```ts
const databaseConfig = "Your database config";
const manager = new GiveawayManager(
    // Required
    client,
    databaseConfig,
    // Optional
    {
        buttons: {
            // Put keys here
        }
    }
)
```

⚠️ Both functions have only one parameter, wich is `customId`<br>
You have to use it in the `.setCustomId()` method, otherwise the manager will not work correctly

#### Participate button

You can customise the participation button by modifying the `participate` function in the `buttons` field.

Here is how to do :

```ts
// Imports
import { ButtonBuilder, ButtonStyle } from 'discord.js';

const databaseConfig = "Your database config";
const manager = new GiveawayManager(
    // Required
    client,
    databaseConfig,
    // Optional
    {
        buttons: {
            // Participate method
            participate: (customId: string) => {
                // Returns a button
                return new ButtonBuilder()
                    .setLabel('Participate')
                    .setStyle(ButtonStyle.Success)
                    // Important ! set the customId using the `customId` parameter
                    .setCustomId(customId)
            }
        }
    }
)
```

#### Unparticipate button

You can customise the unparticipation button by modifying the `cancelParticipation` function in the `buttons` field.

Here is how to do :

```ts
// Imports
import { ButtonBuilder, ButtonStyle } from 'discord.js';

const databaseConfig = "Your database config";
const manager = new GiveawayManager(
    // Required
    client,
    databaseConfig,
    // Optional
    {
        buttons: {
            // cancelParticipation method
            cancelParticipation: (customId: string) => {
                // Returns a button
                return new ButtonBuilder()
                    .setLabel('Unparticipate')
                    .setStyle(ButtonStyle.Danger)
                    // Important ! set the customId using the `customId` parameter
                    .setCustomId(customId)
            }
        }
    }
)
```

### SendMessages option

You can activate the `sendMessage` feature of the manager. This feature allows the bot to send messages at the end/reroll of a giveaway.

The default value is `true`

The message sent can only be either [winners embed](#winners-embed) or [no entries embed](#no-entries-embed)

> If the giveaway ends/reroll with no valid participation, it'll send the [no entries embed](#no-entries-embed), and will send the winners by the [winners embed](#winners-embed)

```ts
const databaseConfig = "Your database configuration";
const client = new Client({ /* options */ });
const manager = new GiveawayManager(
    // Required
    client,
    databaseConfig,
    // Options
    {
        // Send messages option
        sendMessages: true
    }
)
```

## Methods

### Start()

This is the starting method of the manager

Use it once after the module declaration

```ts
// Imports
import { GiveawayManager } from 'discordjs-giveaways';
import { Client, Partials } from 'discord.js';
// If you use MySQL, un-comment the next line and set your database
// import { createConnection } from 'mysql';

// Declare client
const client = new Client({
    intents: ['Guilds'],
    partials: [Partials.Message, Partials.Channel]
});

// Declare manager
const manager = new GiveawayManager(client, 'set your config', {
    // Optionnal options
});

// Start method
manager.start();
```

**Declaration :**

```ts
public start(): void
```

### createGiveaway()

This method creates a giveaway

```ts
client.on('messageCreate', (message) => {
    // This is the creation part
    manager.createGiveaway({
        // Required options
        guild_id: message.guild.id,
        channel: message.channel,
        hoster_id: message.author.id,
        reward: message.content,
        winnerCount: 1,
        time: 60000, // 1 hour
        // Optionnal options
        required_roles: [message.member.roles.highest.id],
        denied_roles: [message.guild.members.me.roles.highest.id],
        bonus_roles: ['1234567895691']
    })
})
```

Arguments :

* `input` : [giveawayInput](#giveaway-input)

Returns : [giveaway](#giveaway-type)

**Declaration :**

```ts
import { giveawayInput, giveaway } from 'discordjs-giveaways';

public createGiveaway(input: giveawayInput): Promise<giveaway>
```

## Types

Some types are used in this manager, here are the explanations one few of them

### Giveaway type

This is the most used type in the manager, returned by most of the [methods](#methods).

It is declared by :

```ts
export type giveaway = {
    guild_id: string; // Id of the server
    channel_id: string; // Id of the channel
    message_id: string; // Id of the message
    hoster_id: string; // Id of the hoster
    reward: string; // Price of the giveaway (ex: Lofi Girl on your server)
    winnerCount: number; // Number of winners
    endsAt: number; // Date of end of the giveaway (in milliseconds)
    participants: string[]; // All identifiers of the participants
    required_roles: string[]; // The identifiers of the required roles
    denied_roles: string[]; // The identifiers of the denied roles
    bonus_roles: string[]; // The identifiers of the bonus roles
    winners: string[]; // The identifiers of the winners. Empty array when giveaway not ended
    ended: boolean; // State of the giveaway
};
```

### Giveaway Input

This is the type used by the [`createGiveaway()` method](#creategiveaway) and the [giveaway display embed](#giveaway-embed)

It takes some of the values of [giveaway Type](#giveaway-type), with some removed because they can't be determined yet.

It is declared by :

```ts
export type giveawayInput = {
    // All of them are always declared
    guild_id: string; // The identifier of the server
    channel: TextChannel; // The channel of the giveaway (as a Text Channel)
    hoster_id: string; // The identifier of the hoster
    reward: string; // The reward of the giveaway
    winnerCount: number; // The number of winners
    time: number; // The time of the giveaway (in milliseconds)
    // These ones are optionnal, so they can be null
    required_roles?: string[]; // The id of required roles
    denied_roles?: string[]; // The id of denied roles
    bonus_roles?: string[]; // The id of bonus roles
};
```

## Examples

Here are few examples of the usage of the manager :

* [Draver Bot](https://github.com/DraverBot/DraverBot) ([Manager declaration](https://github.com/DraverBot/DraverBot/blob/master/src/events/ready.ts#L39-L43), [embeds customisation](https://github.com/DraverBot/DraverBot/blob/master/src/data/giveaway.ts), [buttons customisation](https://github.com/DraverBot/DraverBot/blob/master/src/data/buttons.ts))
