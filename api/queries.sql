CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(25) UNIQUE NOT NULL,
    password VARCHAR(60) NOT NULL,
    role SMALLINT NOT NULL,
    balance INT NOT NULL DEFAULT 10000
);



CREATE TABLE refresh_sessions(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(400) NOT NULL,
    finger_print VARCHAR(32) NOT NULL
);

CREATE TABLE transfers (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount INT NOT NULL,
    receiver_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    description VARCHAR(10),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM users;
SELECT * FROM refresh_sessions;
SELECT * FROM transfers;