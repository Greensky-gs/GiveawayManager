# Documentation for JavaScript

This is the documentation for a JavaScript usage of [Greensky's Giveaways Manager](https://github.com/Greensky-gs/GiveawayManager)

## Manager

Then, once you created the table by using the command, you have to init the giveaway manager

First of all, take the manager in [`./container/javascript`](./container/javascript/)

Here is the way yo create your Discord's Giveaway Manager by Greensky :

```js
// Require the necessary discord.js classes
const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// Require mysql
const mysql = require('mysql');

// Require Giveaway Manager
const GiveawayManager = require('./GiveawaysManager');

// Create a new client instance
const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers ] });

const db = mysql.createConnection({
    host: "your database host",
    database: "database in the host",
    user: "the user that you use",
    password: "The password of the database/user"
});

db.connect((error) => {
    if (error) throw error;

    client.GiveawaysManager = new GiveawaysManager(client, db);
    client.GiveawaysManager.init();

    // And the Giveaways Manager is automatically launched
});
```

## Customisable

Embeds and buttons are customisable in [embeds](./assets/embeds.js) and [buttons](./assets/buttons.js)

### Important

:warning: Let custom ID of [buttons](./assets/buttons.js) for the correct work of Giveaway Manager.

## Propreties

### Required roles

Required roles are roles that you **must** have to enter the giveaway

#### Denied roles

Denied roles are that you **musn't** have to enter the giveaway

#### Bonus roles

Bonus roles are roles that, if you have them, you are luckier to win the giveaway.

:warning: You have **1** more entry by bonus role

## Methods

### Create a giveaway

```js
client.GiveawaysManager.start({
    // All from here are required
    reward: '1 T-shirt',
    winnerCount: 1,
    hosterId: '123456789',
    channel: interaction.channel,
    time: 60000*60, // (1h)
    // All from here to down are optionnal
    bonusRoles: ['1234567989'],
    deniedRoles: ['0001'],
    requiredRoles: ['0002']
});
```

And giveaway is automatically started

#### End a giveaway

It ends a giveaway

```js
await client.GiveawaysManager.end(message.id);
```

##### Returns of end

Returns of end a giveaway are following :

* already ended
* no giveaway
* no guild
* no channel
* no message
* An array with all the winners id.

#### Reroll a giveaway

It rerolls an ended giveaway

```js
client.GiveawaysManager.reroll(message.id);
```

##### Returns of reroll

Returns of reroll a giveaway are following :

* not ended
* no giveaway
* no guild
* no channel
* no message
* An array with all the winners id

#### Fetch a giveaway

It fetchs a giveaway

```js
client.GiveawaysManager.fetch({
    guildId: '00001', // Server id
    messageId: '00002' // Giveaway's message id
});
```

##### Returns of fetch

The returns of fetching a giveaway are following :

* invalid data
* giveaway not found
* An object with giveaway data

#### List all giveaways

List all giveaways of the server

```js
client.GiveawaysManager.list(message.guild.id);
```

#### Returns of list

Returns of list giveaways are following :

* invalid data
* An array with all giveaway's data

#### Delete a giveaway

Delete a giveaway

```js
client.GiveawaysManager.delete(message.guild.id, message.id);
```

#### Returns of delete

Returns of deleting a giveaway are following :

* invalid data
* giveaway not found
* deleted

## Manager is ready

Now you know how to use Greensky's Giveaways Manager.
