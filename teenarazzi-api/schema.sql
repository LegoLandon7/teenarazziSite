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