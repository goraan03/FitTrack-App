INSERT INTO audit_log (category, action, user_id, username, details)
VALUES ('Informacija','TEST_AUDIT', 1, 'admin@primer.com', JSON_OBJECT('hello', 'world'));