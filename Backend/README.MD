# Project Management Platform - Backend

This repository contains the backend code for the **Project Management Platform**, implemented with **FastAPI**, **SQLAlchemy**, and JWT authentication. It supports user management, project creation, task handling, and a subscription system.

---

## Environment Setup

### 1. Create and Activate a Virtual Environment

From the project root directory, create a virtual environment:

````bash
python -m venv venv
`````

Activate the virtual environment:

On Linux/Mac:
bash
`````
source venv/bin/activate
`````

On Windows:
bash
`````
venv\Scripts\activate
`````
## 2. Install Dependencies
Once the virtual environment is activated, install the required dependencies:

bash
`````
pip install -r requirements.txt
`````

3. Maintain Dependencies
If you add new dependencies, update the requirements.txt file:

bash
`````
pip freeze > requirements.txt
`````

### Environment Configuration
Ensure your .env file is properly configured with the following variables to enable authentication and secure operations:


env
`````
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
SECRET_KEY=your_jwt_secret_key
SECRET_TOKEN=your_superuser_secret_token
ACCESS_TOKEN_EXPIRE_MINUTES=30
SECRET_KEY: A randomly generated key used to sign and verify JWT tokens.
SECRET_TOKEN: A secret token used to create a superuser securely.
ACCESS_TOKEN_EXPIRE_MINUTES: Duration (in minutes) for which the JWT token remains valid.
````
`````
How to Generate SECRET_KEY
Run the following Python code to generate a secure key for JWT signing:

bash
`````
python -c "import secrets; print(secrets.token_urlsafe(32))"
Copy the generated key and paste it into your .env file under SECRET_KEY.
`````

## JWT Configuration and Usage
The JWT system is implemented using pyjwt for signing and verifying tokens. It ensures secure authentication across all protected routes.

Key Implementation Files
app/utils.py: Contains the functions for creating and verifying JWT tokens.
app/dependencies.py: Includes the get_current_user dependency, which decodes and validates JWT tokens for route protection.
Functions in app/utils.py

Create a JWT Token
```python
from datetime import datetime, timedelta
from jose import jwt
from app.config import settings

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt

data: A dictionary containing user information (e.g., user_id, role) to be included in the token.

settings.SECRET_KEY: The secret key defined in the .env file.
Algorithm: HS256 is used for secure hashing.

`````
```python
from jose import jwt, JWTError

def verify_access_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload  
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token or expired token.",
        )

`````

Where JWT is Used
User Login (/auth/login)

When a user logs in, a JWT token is generated and returned in the response:
json
```json
{
  "access_token": "your_jwt_token",
  "token_type": "bearer"
}
`````
## Example in app/routers/auth.py:

```python
from app.utils import create_access_token

@router.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(database.get_db)):
    # Validate user credentials
    user = authenticate_user(user_credentials, db)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token(data={"sub": user.username, "role": user.role})
    return {"access_token": token, "token_type": "bearer"}

`````

### Route Protection

##Example in app/dependencies.py:

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.utils import verify_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = verify_access_token(token)
    return payload  # Returns user data from the token
`````

How to Test JWT
Login Endpoint
Send a POST request to /auth/login with valid credentials:
json

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Access Protected Routes

Include the token in the Authorization header as Bearer <your_token> for protected endpoints:
http

Authorization: Bearer <your_jwt_token>
Expired or Invalid Token

Attempt to access a protected route with an invalid or expired token to verify the system denies access.


# Project Structure

```bash
 my_project/
├── app/
│   ├── __init__.py
│   ├── main.py               # FastAPI app setup and configuration
│   ├── routers/              # API routes
│   ├── models/               # Database models
│   ├── utils/                # Helper functions (e.g., JWT generation)
│   ├── database/             # Database setup
│   ├── config.py             # Global settings (e.g., SECRET_KEY)
└── requirements.txt          # Dependency list 
 ```


```
###Features

1. Authentication and Authorization with JWT
JWT Authentication: Users are authenticated via JWT tokens for secure sessions.
Roles: Supports different roles (admin, user, superuser).
Role Management: Admins and superusers can modify roles of other users.

2. User Management
User Registration: Allows users to register with a username, email, and password.
Login: Users can log in to receive a JWT token.
Role Updates: Only admins or superusers can update roles.

3. Project Management
Create Projects: Subscribed users can create projects.
View Projects: Projects are viewable by associated users. Editing requires a subscription.
Add Users to Projects: Admins and superusers can add or remove users from projects.

4. Task Management
Create Tasks: Subscribed users can add tasks to projects.
View Tasks: Tasks within a project are viewable.
Edit Tasks: Only subscribed users can modify tasks.

5. Subscription System
Simulated Subscriptions: Users can activate a subscription with a specific plan (e.g., monthly or yearly).
View Subscription Status: Users can check their subscription status (active or expired).
Cancel Subscriptions: Users can cancel their subscriptions.
```

# Key API Routes

### Users
- **POST /users/**: Create a new user.
- **GET /users/**: Get all users (admin access only).
- **GET /users/{user_id}**: Get user details.
- **PUT /users/{user_id}/role**: Update a user’s role (admin or superuser access only).

### Projects
- **POST /projects/**: Create a new project (subscribed users only).
- **GET /projects/**: Fetch all user-associated projects.
- **GET /projects/{project_id}**: Retrieve project details.
- **PUT /projects/{project_id}**: Update project details (owner or admin access only).
- **DELETE /projects/{project_id}**: Delete a project (owner or admin access only).

### Tasks
- **POST /tasks/**: Add a new task (subscribed users only).
- **GET /projects/{id}/tasks**: Retrieve all tasks within a project.
- **PUT /tasks/{task_id}**: Update a task (subscribed users only).
- **DELETE /tasks/{task_id}**: Delete a task (subscribed users only).

### Subscriptions
- **POST /payment/subscribe**: Activate a subscription.
- **POST /unsubscribe**: Cancel the user’s subscription.
- **GET /subscription/status**: Retrieve the subscription status.
```

### Superuser Creation

To create a superuser, ensure you have configured a `SECRET_TOKEN` in your `.env` file.

1. Generate a secure token:
    ```bash
    python -c "import secrets; print(secrets.token_urlsafe(16))"
    ```
    Add the token to your `.env` file:
    ```env
    SECRET_TOKEN=your_generated_secret_token
    ```

2. Send a POST request to the `/auth/create-superuser` endpoint with the token and user details:
 ```json
 Headers:
{
    "token": "your_generated_secret_token"
}
Body:
{
        "username": "admin",
        "email": "admin@example.com",
        "password": "securepassword123"
}
```

The response will return the details of the created superuser. Ensure this step is performed only once to prevent creating multiple superusers.



