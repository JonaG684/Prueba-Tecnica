# Frontend for Project Management Platform

This is the Frontend of a Project Management Platform built using React, TypeScript, and Material-UI. It enables users to manage projects, invite participants, handle subscriptions, and track tasks in an intuitive dashboard.

## Features

### **Authentication**
- User registration and login functionality.
- Token-based authentication using JWT.

### **Dashboard**
- Displays all projects associated with a user (owned or invited).
- Allows project creation and user invitations.
- Shows a progress bar for tracking task completion in projects.

### **Tasks Management**
- Create, update, and delete tasks for each project.
- Mark tasks as completed or pending.
- View all tasks in a project with real-time updates.

### **Subscription Management**
- Activate, view, or cancel subscriptions.
- Select from available plans (e.g., monthly or yearly).
- Restricts access to project creation or task management for non-subscribed users.

### **Responsive UI**
- Built using Material-UI for a clean and mobile-friendly design.
- Improved UX/UI for easy navigation and intuitive interactions.

---

## Prerequisites
Ensure the following tools are installed on your system:
- **Node.js** (v16 or higher)
- **npm** or **Yarn**
- A running instance of the backend API for the Project Management Platform.

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-repo/frontend-project-management.git
cd frontend-project-management

---

 ###  2. Install Dependencies
 Using npm:

```bash

npm install
```

Or using Yarn:

```bash

yarn install
```
3. Environment Configuration
Create a .env file in the root directory and add the following variables:

env

VITE_API_BASE_URL=http://localhost:8000

-- Replace http://localhost:8000 with the URL of your backend API.

 4. Start the Development Server
 Using npm:

```bash

npm run dev
Or using Yarn:
```

```bash

yarn dev
The application will be available at http://localhost:5173.
```
Scripts
```bash
npm run dev / yarn dev: Starts the development server.
npm run build / yarn build: Builds the application for production.
npm run preview / yarn preview: Previews the production build.
```
## Project Structure

```bash
src/
├── components/       # Reusable UI components
├── context/          # Authentication and global context
├── hooks/            # Custom hooks for shared logic
├── pages/            # Page components (Dashboard, Login, Register, etc.)
├── services/         # API interaction logic
├── utils/            # Utility functions (e.g., validation)
├── App.tsx           # Root component
├── main.tsx          # Application entry point
└── styles/           # Custom global styles
 ```

## Key API Integration

### **Authentication**
- `POST /auth/register`: Register new users.
- `POST /auth/login`: Authenticate users and return a JWT.

### **Projects**
- `GET /projects`: Fetch all user-associated projects.
- `POST /projects`: Create a new project.
- `POST /projects/:id/add_user`: Add a participant to a project.
- `DELETE /projects/:id`: Delete a project.

### **Tasks**
- `GET /projects/:id/tasks`: Retrieve all tasks for a project.
- `POST /tasks`: Create a new task.
- `PUT /tasks/:id`: Update a task.
- `DELETE /tasks/:id`: Delete a task.

### **Subscriptions**
- `GET /subscription/status`: Retrieve subscription details.
- `POST /payment/subscribe`: Activate a subscription.
- `POST /unsubscribe`: Cancel a subscription.

Refer to the backend documentation for full details on API usage.

---

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m 'Add feature name'`).
4. Push to the branch (`git push origin feature-name`).
5. Open a Pull Request.

---

## Customization

### **Styling**
- The application uses Material-UI for UI components.
- Custom styles can be added in the `styles/` folder or by extending Material-UI's theme.

### **Routing**
- Routes are managed using `react-router-dom`. To add or modify routes, edit `App.tsx`.

---

