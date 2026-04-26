-- about page
CREATE TABLE about_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section INTEGER NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending'
        CHECK(status IN ('pending', 'approved', 'rejected')),
    admin_note TEXT, 
    created_at INTEGER DEFAULT (unixepoch()),
    reviewed_at INTEGER
);

CREATE TABLE about_sections (
    id INTEGER PRIMARY KEY,
    content TEXT NOT NULL,
    last_updated INTEGER DEFAULT (unixepoch())
);

-- initial content
INSERT INTO about_sections (id, content) VALUES (1, 'empty');
INSERT INTO about_sections (id, content) VALUES (2, 'empty');
INSERT INTO about_sections (id, content) VALUES (3, 'empty');

-- user pages
CREATE TABLE user_pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- usernames
    main_username TEXT NOT NULL UNIQUE,
    reddit_username TEXT,
    discord_username TEXT,

    -- nicknames
    nicknames TEXT, -- comma seperated

    -- avatars
    main_avatar TEXT,

    -- content
    description TEXT,
    pronouns TEXT,

    -- age
    birthdate INTEGER,

    -- timestamps
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE user_page_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER NOT NULL REFERENCES user_pages(id),

    -- fields that are updated
    field TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT NOT NULL,

    -- submitter notes
    submitter_note TEXT,

    -- review
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK(status IN ('pending', 'approved', 'rejected')),
    admin_note TEXT,
    reviewed_at INTEGER,

    created_at INTEGER DEFAULT (unixepoch())
);