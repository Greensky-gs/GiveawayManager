# Giveaway Manager
This is a Discord Giveaway Manager for discord.js v14
:warning: You need to have a MySQL database to use the Manager

## Use
### Database
First, take the command in [giveaways.sql](./giveaways.sql) and inject it in your MySQL database.
It will create a table working for the manager

### Manager
Then, once you created the table by using the command, you have to init the giveaway manager

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

const db = new mysql.CreateConnection({ ... });
db.connect((error) => {
    if (error) throw error;

    client.GiveawaysManager = new GiveawaysManager(client, db);
    client.GiveawaysManager.init();

    // And the Giveaways Manager is automatically launched
});
```