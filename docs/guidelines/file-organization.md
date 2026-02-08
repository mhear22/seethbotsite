# File Organization Structure

This document defines the standard folder structure and file organization for the project to ensure maintainability and scalability.

## Project Structure Overview

```
seethbotsite/
├── backend/              # Node.js/Express backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── models/           # Database models
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic
│   └── utils/            # Backend utilities
├── frontend/             # Vue.js frontend
│   ├── assets/           # Static assets
│   ├── components/       # Vue components
│   ├── composables/      # Vue composables
│   ├── layouts/          # Layout components
│   ├── pages/            # Page components
│   ├── plugins/          # Vue plugins
│   ├── router/           # Vue Router configuration
│   ├── stores/           # Pinia stores
│   ├── styles/           # Global styles
│   └── utils/            # Frontend utilities
├── docs/                 # Documentation
├── scripts/              # Build and deployment scripts
└── tests/                # Test files
```

## Frontend Structure Details

### `components/`

Global and reusable Vue components.

```
components/
├── common/              # Shared UI components
│   ├── Button.vue
│   ├── Modal.vue
│   └── Input.vue
├── features/            # Feature-specific components
│   ├── fishing/
│   │   ├── FishingGame.vue
│   │   ├── FishingRod.vue
│   │   └── CatchDisplay.vue
│   ├── ranking/
│   │   ├── Leaderboard.vue
│   │   ├── RankBadge.vue
│   │   └── XPBar.vue
│   └── tickets/
│       ├── TicketCard.vue
│       ├── TicketList.vue
│       └── TicketStatus.vue
└── layouts/             # Layout components
    ├── DefaultLayout.vue
    └── AuthLayout.vue
```

### `composables/`

Reusable Vue composition functions.

```
composables/
├── use-timer.js         # Timer management
├── use-clicker.js       # Clicker game logic
├── use-local-storage.js # Local storage helpers
└── use-debounce.js      # Debounce utilities
```

### `stores/`

Pinia state management stores.

```
stores/
├── ticket-store.js      # Ticket state and actions
├── fishing-store.js     # Fishing game state
├── ranking-store.js     # User ranking and XP
└── user-store.js        # User authentication and profile
```

### `pages/`

Page-level components (route targets).

```
pages/
├── Home.vue
├── Fishing.vue
├── Tickets.vue
├── Ranking.vue
└── Profile.vue
```

### `router/`

Vue Router configuration.

```
router/
├── index.js             # Router setup
└── routes/              # Route definitions
    ├── index.js         # Main routes
    └── auth.js          # Auth routes
```

### `styles/`

Global styles and themes.

```
styles/
├── main.scss            # Main stylesheet
├── variables.scss       # SCSS variables
├── mixins.scss          # SCSS mixins
└── themes/              # Theme variations
    └── dark.scss
```

### `utils/`

Frontend utility functions.

```
utils/
├── format-date.js       # Date formatting
├── format-number.js     # Number formatting
├── validation.js        # Input validation
└── constants.js         # Application constants
```

## Backend Structure Details

### `config/`

Configuration files and environment variables.

```
config/
├── database.js          # Database configuration
├── discord.js           # Discord bot setup
└── index.js             # Main config exports
```

### `controllers/`

Request handlers that bridge routes and services.

```
controllers/
├── ticket-controller.js # Ticket CRUD operations
├── fishing-controller.js # Fishing game endpoints
└── user-controller.js   # User management
```

### `middleware/`

Express middleware functions.

```
middleware/
├── auth.js              # Authentication middleware
├── error-handler.js     # Error handling
└── rate-limit.js       # Rate limiting
```

### `models/`

Database models/schemas.

```
models/
├── Ticket.js            # Ticket model
├── User.js              # User model
└── FishingCatch.js      # Fishing catch records
```

### `routes/`

API route definitions.

```
routes/
├── index.js             # Route aggregator
├── ticket-routes.js     # Ticket endpoints
├── fishing-routes.js    # Fishing game endpoints
└── user-routes.js       # User endpoints
```

### `services/`

Business logic layer.

```
services/
├── ticket-service.js    # Ticket business logic
├── fishing-service.js   # Fishing game logic
└── rank-service.js      # Ranking calculations
```

### `utils/`

Backend utility functions.

```
utils/
├── logger.js            # Logging utilities
├── validation.js        # Request validation
└── helpers.js           # General helpers
```

## Documentation Structure

### `docs/`

Project documentation.

```
docs/
├── README.md            # Documentation index
├── DECISIONS.md         # Architectural decisions
├── guidelines/          # Development guidelines
│   ├── component-naming.md
│   ├── file-organization.md
│   ├── code-style.md
│   └── testing.md
└── features/            # Feature documentation
    ├── ranking-system.md
    ├── clicker-game.md
    ├── ticket-system.md
    ├── character-tinder.md
    └── fishing-game.md
```

## File Placement Guidelines

### When to Create New Folders

1. **Group related files:** When 3+ files share a common domain
2. **Prevent clutter:** When a folder has 10+ files, consider sub-grouping
3. **Clear boundaries:** Each folder should have a single, clear purpose
4. **Avoid deep nesting:** Keep structure shallow (max 3-4 levels)

### When to Group vs Flatten

**Use folders when:**
- Files represent a cohesive feature or module
- You anticipate adding more related files
- The group has shared dependencies

**Keep files flat when:**
- Only 1-2 files in a category
- Files are used across multiple features
- Simplicity is more important than organization

## Import Path Conventions

### Aliases

```javascript
// frontend/vite.config.js
export default {
  resolve: {
    alias: {
      '@': '/frontend/src',
      '@components': '/frontend/src/components',
      '@stores': '/frontend/src/stores',
      '@composables': '/frontend/src/composables',
      '@utils': '/frontend/src/utils',
    }
  }
}
```

### Import Examples

```javascript
// Components
import UserProfile from '@components/features/user/UserProfile.vue'
import Button from '@components/common/Button.vue'

// Stores
import useTicketStore from '@stores/ticket-store'

// Composables
import useTimer from '@composables/use-timer'

// Utils
import formatDate from '@utils/format-date'
```

## Testing File Organization

```
tests/
├── unit/                # Unit tests
│   ├── components/
│   ├── composables/
│   └── utils/
├── integration/         # Integration tests
│   ├── api/
│   └── stores/
└── e2e/                 # End-to-end tests
    └── scenarios/
```

## Best Practices

1. **One file per concern:** Don't combine multiple concerns in one file
2. **Co-location:** Keep related files near each other
3. **Clear naming:** Folder and file names should be self-explanatory
4. **Avoid circular dependencies:** Structure should prevent import cycles
5. **Document non-obvious structures:** Add README.md files to complex folders

## When to Reorganize

Consider reorganizing when:
- A folder has become cluttered (10+ files without clear grouping)
- A file doesn't fit in any existing folder
- Developers are frequently asking "where is X file?"
- New features don't have a logical home

Always:
1. Create a plan first
2. Update imports atomically
3. Run tests after changes
4. Update documentation
