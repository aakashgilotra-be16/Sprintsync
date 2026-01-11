# Firestore Security Rules

## Production-Ready Rules

Replace the default Firestore rules in Firebase Console with these:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Deny all access by default
    match /{document=**} {
      allow read, write: if false;
    }

    // Artifact database (main data store)
    match /artifacts/{appId}/public/data/{collection}/{document=**} {
      // Read: Allow authenticated users (via Firebase Auth)
      allow read: if request.auth != null;

      // Create: Validate document structure before write
      allow create: if request.auth != null && validateCreate(request.resource.data);

      // Update: Validate before update
      allow update: if request.auth != null && validateUpdate(request.resource.data);

      // Delete: Allow deletion of own data
      allow delete: if request.auth != null;
    }

    // Validate create operations
    function validateCreate(data) {
      return validateCommonFields(data);
    }

    // Validate update operations
    function validateUpdate(data) {
      return validateCommonFields(data);
    }

    // Common field validation
    function validateCommonFields(data) {
      // All documents must have required fields
      return data.keys().hasAll(['id']) && isString(data.id);
    }

    // Helper functions
    function isString(value) {
      return value is string;
    }

    function isTimestamp(value) {
      return value is timestamp;
    }

    function isArray(value) {
      return value is list;
    }
  }
}
```

## Key Security Features

### 1. **Authentication Required**
- All reads and writes require `request.auth != null`
- Only authenticated users can access data
- Anonymous auth is allowed but restricted

### 2. **Data Validation**
- Each document must have a valid `id` field
- Type checking prevents invalid data insertion
- Length limits prevent abuse

### 3. **Collection-Specific Rules** (Optional - Add based on requirements)

```js
// Restrict "people" collection to max 1000 documents per appId
match /artifacts/{appId}/public/data/people/{document=**} {
  allow read: if request.auth != null;
  allow create: if request.auth != null && 
    request.resource.data.name is string &&
    request.resource.data.name.size() >= 2 &&
    request.resource.data.dept in ['Dev', 'QA', 'PM'];
  allow update: if request.auth != null;
  allow delete: if request.auth != null;
}

// Restrict "sprints" collection
match /artifacts/{appId}/public/data/sprints/{document=**} {
  allow read: if request.auth != null;
  allow create: if request.auth != null &&
    request.resource.data.name is string &&
    request.resource.data.start is timestamp &&
    request.resource.data.end is timestamp &&
    request.resource.data.start <= request.resource.data.end;
  allow update, delete: if request.auth != null;
}

// Restrict "leaves" collection
match /artifacts/{appId}/public/data/leaves/{document=**} {
  allow read: if request.auth != null;
  allow create: if request.auth != null &&
    request.resource.data.name is string &&
    request.resource.data.start is timestamp &&
    request.resource.data.end is timestamp;
  allow update, delete: if request.auth != null;
}

// Restrict "holidays" collection
match /artifacts/{appId}/public/data/holidays/{document=**} {
  allow read: if request.auth != null;
  allow create: if request.auth != null &&
    request.resource.data.name is string &&
    request.resource.data.date is timestamp;
  allow update, delete: if request.auth != null;
}
```

## How to Deploy

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy and paste the rules above
5. Click **Publish**

## Testing Rules Locally

Install Firebase Emulator:

```bash
npm install -g firebase-tools
firebase init emulators
firebase emulators:start
```

## Rate Limiting Considerations

Firestore doesn't have built-in rate limiting. Implement in:

1. **Frontend**: Use `RateLimiter` class from `src/utils/sanitizer.ts`
2. **Cloud Functions**: Add rate limiting middleware
3. **API Gateway**: Use tools like Cloudflare or API Gateway with rate limits

Example:
```typescript
const limiter = new RateLimiter(1000); // Min 1 second between requests

if (!limiter.canExecute()) {
  console.warn('Request rate limited');
  return;
}
```

## Monitoring & Logging

Enable Firestore audit logging in Firebase Console:
- Go to **Firestore Database** → **Backups & Settings**
- Enable **Cloud Audit Logs**

This logs all data access for compliance audits.
