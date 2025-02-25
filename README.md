array, [26.02.2025 0:58]
# YumBook - The Recipe Manager

## About YumBook
**YumBook** is a **modern recipe management API** designed with **Node.js, Express.js, and MongoDB**.  
This API enables users to **store, update, organize, and share** their favorite recipes.  
With built-in authentication, user profile management, and recipe categorization, YumBook makes it easier than ever to explore the world of cooking.

---

## Key Features
- **Secure User Authentication** (JWT-based)
- **Recipe CRUD Operations** (Create, Read, Update, Delete)
- **User Profile Management**
- **Cloud Database Integration (MongoDB)**
- **Authentication Middleware for Protected Routes**

---

## Getting Started
### **1. Clone the Repository**
```sh
git clone https://github.com/YOUR_GITHUB_USERNAME/YumBook.git
cd YumBook/backend
```

###  **2. Install Required Packages**
```sh
npm install
```

### **3. Configure Environment Variables**
Create a `.env` file in the project's root folder and add the following:

```plaintext
MONGO_URI= your_mongodb_string
DB_NAME= your_database_name
JWT_SECRET= your_token
PORT=5000

```

###  **4. Start the API Server**
```sh
npm start
```
The backend service will be live at `http://localhost:5000/`.

---

##  API Documentation
###  **Authentication Endpoints**
####  **1. Register a New User**
```http
POST /register
```
 **Request Body:**
```json
{
    "email": "chef@example.com",
    "password": "securePass123"
}
```
**Response:**
```json
{
    "message": "Your account has been created."
}
```

#### **2. User Login**
```http
POST /login
```
**Request Body:**
```json
{
    "email": "chef@example.com",
    "password": "securePass123"
}
```
 **Response:**
```json
{
    "token": "your_generated_jwt_token",
    "user": {
        "id": "unique_user_id",
        "email": "chef@example.com"
    }
}
```

---

### **User Management**
#### **3. Fetch User Profile**
```http
GET /users/me   
Authorization: Bearer <your_jwt_token>
```
📤 **Response:**
```json
{
    "_id": "user_unique_id",
    "username": "chefMaster",
    "email": "chef@example.com"
}
```

#### **4. Update User Email**
```http
PUT /users/update-email
Authorization: Bearer <your_jwt_token>
```
📥 **Request Body:**
```json
{
    "email": "new_email@example.com"
}
```
📤 **Response:**
```json
{
    "message": "Email successfully updated",
    "user": {
        "_id": "user_unique_id",
        "username": "chefMaster",
        "email": "new_email@example.com"
    }
}
```

#### **5. Update User Password**
```http
PUT /users/update-password
Authorization: Bearer <your_jwt_token>
```
📥 **Request Body:**
```json
{
    "currentPassword": "old_password",
    "newPassword": "new_secure_password"
}
```
📤 **Response:**
```json
{
    "message": "Password successfully updated"
}
```
---

###  **Recipe Management**
####  **6. Add a New Recipe**
```http
POST /recipes
Authorization: Bearer <your_jwt_token>
```
📥 **Request Body:**
```json
{
    "title": "Spaghetti Bolognese",
    "ingredients": ["Spaghetti", "Ground Beef", "Tomato Sauce", "Garlic", "Onion"],
    "category": "Dinner",
    "instructions": "Cook pasta, prepare the sauce, mix together, and enjoy!"
}
```
📤 **Response:**
```json
{
    "_id": "recipe_unique_id",
    "title": "Spaghetti Bolognese",
    "ingredients": ["Spaghetti", "Ground Beef", "Tomato Sauce", "Garlic", "Onion"],
    "category": "Dinner",
    "instructions": "Cook pasta, prepare the sauce, mix together, and enjoy!",
    "createdBy": "user_id",
    "createdAt": "timestamp"
}
```

array, [26.02.2025 0:58]


#### **7. Retrieve All Recipes**
```http
GET /recipes
Authorization: Bearer <your_jwt_token>
```
**Response:**
```json
[
    {
        "_id": "recipe1",
        "title": "Spaghetti Bolognese",
        "ingredients": ["Spaghetti", "Ground Beef", "Tomato Sauce", "Garlic", "Onion"],
        "category": "Dinner",
        "createdBy": {
            "_id": "user1",
            "username": "chefMaster"
        },
        "createdAt": "timestamp"
    },
    {
        "_id": "recipe2",
        "title": "Tiramisu",
        "ingredients": ["Coffee", "Mascarpone", "Eggs", "Sugar", "Cocoa Powder"],
        "category": "Dessert",
        "createdBy": {
            "_id": "user2",
            "username": "dessertQueen"
        },
        "createdAt": "timestamp"
    }
]
```

#### **8. Fetch a Specific Recipe**
```http
GET /recipes/:id
Authorization: Bearer <your_jwt_token>
```
**Response:**
```json
{
    "_id": "recipe_unique_id",
    "title": "Spaghetti Bolognese",
    "ingredients": ["Spaghetti", "Ground Beef", "Tomato Sauce", "Garlic", "Onion"],
    "category": "Dinner",
    "instructions": "Cook pasta, prepare the sauce, mix together, and enjoy!",
    "createdBy": "user_id",
    "createdAt": "timestamp"
}

```
#### **9. Modify an Existing Recipe**
```http
PUT /recipes/:id
Authorization: Bearer <your_jwt_token>
```
📥 **Request Body:**
```json
{
    "title": "Spaghetti Arrabiata",
    "ingredients": ["Spaghetti", "Tomato Sauce", "Chili Peppers"],
    "category": "Dinner",
    "instructions": "Boil pasta, prepare spicy sauce, mix and serve!"
}
```
**Response:**
```json
{
    "message": "Recipe has been updated successfully!"
}
```

#### **10. Remove a Recipe**
```http
DELETE /recipes/:id
Authorization: Bearer <your_jwt_token>
```
**Response:**
```json
{
    "message": "The recipe has been successfully removed!"
}
```
---
### Error handling 

- 400 Bad Request.

- 401 Unauthorized.

- 500 Internal Server Error.
---

## Deployment Guide
You can deploy **YumBook API** on **Railway, Render, or Fly.io**.

### **Deploy to Render**
1. **Push Code to GitHub**
```sh
git add .
git commit -m "Deploy API"
git push origin main
```
3. **Test API Endpoint**
```sh
curl -X GET https://your-deployed-url.com/recipes
```
1. Sign up/log in to Render and create a new Web Service.
2. Connect your GitHub repository containing the project.
3. Add environment variables (e.g., database connection strings, JWT secret) in the Environment section.
4. Click Create Web Service to deploy. Render will automatically build and deploy the project.
5. Automatic deployment happens on each push to your repository.
---

## License
This project is **open-source** and distributed under the **MIT License**.  
Feel free to **contribute, modify, and improve** the project!