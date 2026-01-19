# Outro

A full-stack blogging application with user authentication, post management, and comment system built with Express.js and Prisma.

## Features

- **User Authentication**: Secure login and registration with JWT and bcrypt
- **Blog Posts**: Create, read, update, and publish blog posts with slugs and cover images
- **Comments**: Moderated comment system for community engagement
- **Post Tags**: Organize posts with customizable tags
- **Author Profiles**: View author information and their published posts
- **Responsive Design**: Clean, responsive UI built with EJS templating
- **Security**: Helmet.js, CORS, rate limiting, and input validation
- **Performance**: Compression, query optimization with Prisma

## Tech Stack

### Backend

- **Framework**: Express.js 5.x
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcryptjs
- **Validation**: Express Validator
- **Security**: Helmet.js, CORS, Rate Limiting
- **Templating**: EJS with express-ejs-layouts

### Frontend

- **View Engine**: EJS
- **Styling**: CSS
- **JavaScript**: Vanilla JS for client-side interactivity

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Environment variables setup

## Installation

1. Clone the repository

```bash
git clone https://github.com/Micah-Pirikisi/outro.git
cd outro
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables
   Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/outro"
JWT_SECRET="your_jwt_secret_key_here"
PORT=3000
```

4. Run database migrations

```bash
npm run prisma:migrate
```

5. Seed the database (optional)

```bash
npm run prisma:seed
```

## Usage

### Development

Start the development server with auto-reload:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production

```bash
npm start
```

## Project Structure

```
src/
├── controllers/       # Request handlers
│   ├── authController.js
│   ├── commentController.js
│   ├── postController.js
│   └── viewController.js
├── middleware/        # Custom middleware
│   └── auth.js
├── routes/           # Route definitions
│   ├── authRoutes.js
│   ├── commentRoutes.js
│   ├── postsRoutes.js
│   └── viewRoutes.js
├── lib/              # Library utilities
│   └── prisma.js
├── utils/            # Helper functions
│   └── slugify.js
├── views/            # EJS templates
│   ├── layout.ejs
│   ├── index.ejs
│   ├── post.ejs
│   ├── author.ejs
│   └── ...
├── public/           # Static assets
│   ├── css/
│   ├── js/
│   └── uploads/
└── index.js          # Application entry point

prisma/
├── schema.prisma     # Database schema
├── seed.js          # Database seeding
└── migrations/      # Database migrations
```

## Database Schema

### User

- `id`: Unique user identifier
- `email`: User email (unique)
- `name`: User display name
- `password`: Hashed password
- `role`: User role (default: "user")
- `createdAt`: Account creation timestamp

### Post

- `id`: Unique post identifier
- `title`: Post title
- `slug`: URL-friendly slug
- `excerpt`: Short post summary
- `content`: Full post content
- `status`: Post status (draft, published, archived)
- `publishedAt`: Publication timestamp
- `coverImage`: Featured image URL
- `authorId`: Reference to post author
- `tags`: Array of post tags
- `createdAt`, `updatedAt`: Timestamps

### Comment

- `id`: Unique comment identifier
- `postId`: Reference to commented post
- `author`: Commenter name
- `email`: Commenter email
- `body`: Comment text
- `approved`: Moderation status
- `createdAt`: Comment timestamp

## API Endpoints

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Posts

- `GET /posts` - Get all published posts
- `POST /posts` - Create new post (authenticated)
- `GET /posts/:slug` - Get single post
- `PUT /posts/:id` - Update post (authenticated)
- `DELETE /posts/:id` - Delete post (authenticated)

### Comments

- `POST /comments/:postId` - Add comment
- `GET /comments/:postId` - Get post comments
- `PUT /comments/:id/approve` - Approve comment (authenticated)
- `DELETE /comments/:id` - Delete comment (authenticated)

### Views

- `GET /` - Homepage
- `GET /about` - About page
- `GET /author/:slug` - Author profile

## Environment Variables

| Variable       | Description                  | Example                                  |
| -------------- | ---------------------------- | ---------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost/outro` |
| `JWT_SECRET`   | JWT signing secret           | `your_secret_key`                        |
| `PORT`         | Server port                  | `3000`                                   |

## Security Features

- **Helmet.js**: HTTP security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **Input Validation**: Express Validator
- **Sanitization**: HTML sanitization for user content
- **Password Hashing**: bcryptjs
- **JWT**: Secure session tokens

## Development Scripts

- `npm run dev` - Start development server with file watching
- `npm start` - Start production server
- `npm run prisma:migrate` - Create database migration
- `npm run prisma:studio` - Open Prisma Studio
- `npm test` - Run tests (not configured)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions, please use the [GitHub Issues](https://github.com/Micah-Pirikisi/outro/issues) page.

---

Built with ❤️ by Micah Pirikishi
