CREATE TABLE test_task (
    id varchar(255) PRIMARY KEY,
    name varchar(255),
    description text,
    context_length int NULL,
    tokenizer varchar(255) NULL,
    modality varchar(255)
)