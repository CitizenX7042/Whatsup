-- Azure SQL Database schema for WhatsApp agent
-- Run this script against your Azure SQL Database (e.g. via Azure Data Studio, SSMS, or sqlcmd)
--
-- Prerequisites: database already created in Azure
-- Usage: Connect to your database, then execute this script

-- Chats: one row per conversation (identified by external chatId from transport)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'chats')
BEGIN
  CREATE TABLE chats (
    id NVARCHAR(255) NOT NULL,
    created_at DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_chats PRIMARY KEY (id)
  );
END
GO

-- Messages: incoming and outgoing, linked to chats
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'messages')
BEGIN
  CREATE TABLE messages (
    id NVARCHAR(255) NOT NULL,
    chat_id NVARCHAR(255) NOT NULL,
    direction NVARCHAR(20) NOT NULL,
    text NVARCHAR(MAX) NOT NULL,
    raw_payload NVARCHAR(MAX) NULL,
    created_at DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_messages PRIMARY KEY (id),
    CONSTRAINT FK_messages_chat FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    CONSTRAINT CK_messages_direction CHECK (direction IN ('incoming', 'outgoing'))
  );

  -- Index for loading recent messages by chat (most common query)
  CREATE NONCLUSTERED INDEX IX_messages_chat_created
    ON messages (chat_id, created_at DESC);

  -- Index for time-based queries if needed
  CREATE NONCLUSTERED INDEX IX_messages_created_at
    ON messages (created_at DESC);
END
GO
