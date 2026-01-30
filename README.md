# 📋 Task Manager - Full Stack Web Application

A modern, full-stack task management application built with Spring Boot and React, developed collaboratively with AI assistance.

## 🚀 Tech Stack

### Backend
<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" alt="Java" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" alt="Spring Boot" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" alt="PostgreSQL" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/maven/maven-original.svg" alt="Maven" width="40" height="40"/>
</p>

- **Java 17+** - Programming language
- **Spring Boot 3.2.1** - Backend framework
- **Spring Data JPA** - Database access
- **PostgreSQL** - Relational database
- **Maven** - Build tool
- **Lombok** - Code generation

### Frontend
<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="React" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" alt="TypeScript" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/materialui/materialui-original.svg" alt="Material UI" width="40" height="40"/>
</p>

- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Material UI (MUI)** - Component library
- **Axios** - HTTP client

## ✨ Features

### Core Features
- ✅ **Create** tasks with title, description, category, and due date
- ✅ **Read** and view all tasks in a responsive list
- ✅ **Update** task details and status
- ✅ **Delete** tasks with confirmation
- ✅ **Task Status** management (TODO, IN_PROGRESS, DONE) via dropdown
- ✅ **Form Validation** with character limits (title: 100, description: 500)
- ✅ **Error Handling** with user-friendly messages

### Advanced Features
- 🔍 **Search** tasks by title or description (debounced)
- 🏷️ **Categories** for task organization
- 🔽 **Filter** by status or category
- 📊 **Sort** by status, due date, or title
- 📅 **Due Date** tracking with overdue highlighting
- 🎨 **Color-coded** status chips (TODO, IN_PROGRESS, DONE)
- 📱 **Responsive Design** for mobile and desktop

## 📋 Prerequisites

### Required Software
- **Java 17+** - [Download](https://adoptium.net/)
- **Maven 3.8+** - [Download](https://maven.apache.org/download.cgi)
- **PostgreSQL 16+** - [Download](https://www.postgresql.org/download/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm or yarn** - Comes with Node.js

### PostgreSQL Setup

#### Installation
```bash
# macOS (using Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Add PostgreSQL to PATH (for Apple Silicon)
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Linux (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start

# Windows
# Download installer from postgresql.org and run
```

#### Create Database
```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE taskmanager;
CREATE USER taskuser WITH PASSWORD 'taskpass';
GRANT ALL PRIVILEGES ON DATABASE taskmanager TO taskuser;
GRANT ALL ON SCHEMA public TO taskuser;
\q

# Verify connection
psql -U taskuser -d taskmanager -h localhost
```

## 🛠️ Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd task-manager-agentic-ai
```

### 2. Environment Configuration

Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DB_URL=jdbc:postgresql://localhost:5432/taskmanager
DB_USERNAME=taskuser
DB_PASSWORD=taskpass
SERVER_PORT=8080
FRONTEND_URL=http://localhost:5173
```

### 3. Backend Setup
```bash
cd backend

# Install dependencies and build
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🎯 Usage

1. **Access the Application**: Open `http://localhost:5173` in your browser
2. **Create Task**: Click the "+" floating action button
3. **Edit Task**: Click the edit icon on any task card
4. **Change Status**: Use the dropdown menu on each task
5. **Delete Task**: Click the delete icon (with confirmation)
6. **Search**: Type in the search bar (searches title and description)
7. **Filter**: Use the status or category filters
8. **Sort**: Choose sort order (status, date, or title)

## 📡 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/tasks` | Get all tasks | - |
| `GET` | `/tasks/{id}` | Get task by ID | - |
| `POST` | `/tasks` | Create new task | Task JSON |
| `PUT` | `/tasks/{id}` | Update task | Task JSON |
| `DELETE` | `/tasks/{id}` | Delete task | - |

### Task JSON Structure
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive README with setup instructions",
  "status": "IN_PROGRESS",
  "category": "Work",
  "dueDate": "2024-02-15"
}
```

### Status Values
- `TODO` - Task not started
- `IN_PROGRESS` - Task in progress
- `DONE` - Task completed

### Example Requests

#### Create Task
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "This is a test task",
    "status": "TODO",
    "category": "Personal"
  }'
```

#### Get All Tasks
```bash
curl http://localhost:8080/api/tasks
```

#### Update Task
```bash
curl -X PUT http://localhost:8080/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Task",
    "status": "DONE"
  }'
```

#### Delete Task
```bash
curl -X DELETE http://localhost:8080/api/tasks/1
```

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Run all tests
mvn test

# Run tests with coverage
mvn test jacoco:report

# Run specific test class
mvn test -Dtest=TaskServiceTest
```

### Frontend Tests
```bash
cd frontend

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📦 Production Build

### Backend
```bash
cd backend
mvn clean package
java -jar target/task-manager-1.0.0.jar
```

### Frontend
```bash
cd frontend
npm run build
# Output will be in the 'dist' folder
```

## 🚀 Deployment

### Backend Deployment (Render.com)
1. Create PostgreSQL database on Render
2. Create Web Service from GitHub repository
3. Set environment variables (DB_URL, DB_USERNAME, DB_PASSWORD)
4. Deploy

### Frontend Deployment (Vercel)
1. Connect GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Set environment variable: `VITE_API_URL=<backend-url>`
5. Deploy

## 🤖 AI Development Process

This project was developed collaboratively with Claude (Anthropic's AI assistant). See [AI_USAGE.md](AI_USAGE.md) for detailed documentation of:
- AI-assisted code generation
- Debugging with AI
- API design decisions
- Architectural choices
- Test case generation
- Critical reflections on AI usage

## 📁 Project Structure

```
task-manager-agentic-ai/
├── backend/                      # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/taskmanager/
│   │   │   │   ├── model/       # Entity classes
│   │   │   │   ├── repository/  # JPA repositories
│   │   │   │   ├── service/     # Business logic
│   │   │   │   └── controller/  # REST controllers
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/                # Unit & integration tests
│   └── pom.xml                  # Maven configuration
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── services/            # API services
│   │   ├── types/               # TypeScript types
│   │   └── App.tsx              # Main app component
│   ├── package.json
│   └── vite.config.ts
├── .env.example                 # Environment template
├── .gitignore
└── README.md
```

## 🔒 Security Notes

- Database credentials are stored in environment variables
- `.env` files are excluded from version control
- CORS is configured for specific origins
- Input validation on both frontend and backend
- SQL injection prevention via JPA/Hibernate

## 🐛 Troubleshooting

### Backend Issues

**Port 8080 already in use**
```bash
# Find and kill process using port 8080
lsof -ti:8080 | xargs kill -9
```

**Database connection failed**
```bash
# Verify PostgreSQL is running
brew services list | grep postgresql
# or
sudo service postgresql status

# Test connection
psql -U taskuser -d taskmanager -h localhost
```

### Frontend Issues

**Port 5173 already in use**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

**CORS errors**
- Ensure backend is running on port 8080
- Check CORS configuration in TaskController.java

## 📝 License

This project is for educational purposes.

## 👥 Contributing

This project was built as part of an Agentic SDLC learning exercise.

## 🙏 Acknowledgments

- Built with assistance from Claude (Anthropic)
- Icons from [Devicon](https://devicon.dev/)
- UI components from [Material UI](https://mui.com/)

---

**Note**: This project demonstrates collaborative development between human developers and AI assistants, showcasing modern full-stack development practices with Spring Boot and React.
