INSERT INTO audit_log (category, action, user_id, username, details)
VALUES ('Informacija','TEST_AUDIT', 1, 'gorangrcic76@gmail.com', JSON_OBJECT('hello', 'world'));