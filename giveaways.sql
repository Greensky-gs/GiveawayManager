CREATE TABLE giveaways (
    guild_id TEXT(255) NOT NULL,
    channel_id TEXT(255) NOT NULL,
    message_id TEXT(255) NOT NULL,
    hoster_id TEXT(255) NOT NULL,
    reward TEXT(255) NOT NULL,
    winnerCount INTEGER(255) NOT NULL DEFAULT "1",
    endsAt VARCHAR(1024) NOT NULL,
    participants LONGTEXT NOT NULL DEFAULT '[]',
    required_roles LONGTEXT NOT NULL DEFAULT '[]',
    denied_roles LONGTEXT NOT NULL DEFAULT '[]',
    bonus_roles LONGTEXT NOT NULL DEFAULT '[]',
    winners LONGTEXT NOT NULL DEFAULT '[]',
    ended TINYINT(1) NOT NULL DEFAULT "0"
);