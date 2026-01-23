// MongoDB initialization script for local development
db = db.getSiblingDB('lera-ai');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'passwordHash', 'createdAt'],
      properties: {
        email: {
          bsonType: 'string',
          description: 'User email address',
        },
        passwordHash: {
          bsonType: 'string',
          description: 'Hashed password',
        },
        firstName: {
          bsonType: 'string',
        },
        lastName: {
          bsonType: 'string',
        },
        role: {
          enum: ['admin', 'partner', 'associate', 'viewer'],
        },
        mfaEnabled: {
          bsonType: 'bool',
        },
        createdAt: {
          bsonType: 'date',
        },
        updatedAt: {
          bsonType: 'date',
        },
        deletedAt: {
          bsonType: ['date', 'null'],
        },
      },
    },
  },
});

db.createCollection('audit_logs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'action', 'timestamp'],
      properties: {
        userId: {
          bsonType: 'objectId',
        },
        action: {
          enum: ['DOCUMENT_ACCESS', 'AI_SYNTHESIS', 'EXPORT', 'LOGIN', 'LOGOUT', 'USER_CREATE', 'USER_UPDATE'],
        },
        resourceType: {
          enum: ['MATTER', 'DOCUMENT', 'TEMPLATE', 'USER', 'SYSTEM'],
        },
        resourceId: {
          bsonType: 'string',
        },
        metadata: {
          bsonType: 'object',
        },
        ipAddress: {
          bsonType: 'string',
        },
        userAgent: {
          bsonType: 'string',
        },
        timestamp: {
          bsonType: 'date',
        },
      },
    },
  },
});

db.createCollection('matters', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'status', 'createdAt'],
      properties: {
        title: {
          bsonType: 'string',
        },
        imanageId: {
          bsonType: 'string',
        },
        status: {
          enum: ['draft', 'review', 'approved', 'exported'],
        },
        clientName: {
          bsonType: 'string',
        },
        counterparties: {
          bsonType: 'array',
        },
        dealValue: {
          bsonType: 'object',
        },
        leadPartner: {
          bsonType: 'objectId',
        },
        synthesizedData: {
          bsonType: 'object',
        },
        confidenceScore: {
          bsonType: 'double',
        },
        createdAt: {
          bsonType: 'date',
        },
        updatedAt: {
          bsonType: 'date',
        },
        deletedAt: {
          bsonType: ['date', 'null'],
        },
      },
    },
  },
});

db.createCollection('refresh_tokens');
db.createCollection('templates');
db.createCollection('exports');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ deletedAt: 1 });

db.audit_logs.createIndex({ userId: 1 });
db.audit_logs.createIndex({ timestamp: -1 });
db.audit_logs.createIndex({ action: 1, timestamp: -1 });

db.matters.createIndex({ status: 1 });
db.matters.createIndex({ leadPartner: 1 });
db.matters.createIndex({ imanageId: 1 });
db.matters.createIndex({ deletedAt: 1 });

db.refresh_tokens.createIndex({ userId: 1 });
db.refresh_tokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

print('MongoDB initialized successfully for Lera AI');
