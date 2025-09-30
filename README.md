# Expense Tracker

A  web application designed to help users manage and track their personal expenses. This application provides a clean, intuitive interface for logging expenses, viewing spending habits.

## Key Features

- **User Authentication:** Secure signup and login functionality to protect user data.
- **Expense Management:** Users can create, view, update, and delete their expenses.
- **Categorization:** Assign categories to expenses (e.g., Food, Transport, Utilities) for better organization.
- **Dynamic Dashboard:** A user-friendly dashboard that displays a summary of all transactions and a running balance.
- **Responsive Design:** A clean and modern UI that works seamlessly on both desktop and mobile devices.

## Technologies Used

- **Backend:**
  - **Node.js:** JavaScript runtime for the server.
  - **NestJS:** A progressive Node.js framework for building efficient and scalable server-side applications.
  - **TypeScript:** A typed superset of JavaScript that enhances code quality and maintainability.
  - **MongoDB:** A NoSQL database for storing user and expense data.
  - **Mongoose:** An Object Data Modeling (ODM) library for MongoDB and Node.js.

- **Frontend:**
  - **HTML5 & CSS3:** For structuring and styling the user interface.
  - **JavaScript (ES6+):** For client-side logic and interactivity.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- MongoDB (local or remote instance)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Miemmy/Expense-Tracker.git
   ```

2. **Navigate to the project directory:**
   ```sh
   cd expense-tracker
   ```

3. **Install NPM packages:**
   ```sh
   npm install
   ```

4. **Set up environment variables:**
   Create a `.env` file in the root directory and add the following variables:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

### Running the Application

- **Development Mode:**
  ```sh
  npm run start:dev
  ```
  The application will be available at `http://localhost:6000`.

- **Production Mode:**
  ```sh
  npm run start:prod
  ```

## API Endpoints

The following are the primary API endpoints available:

| Method | Endpoint          | Description                    |
|--------|-------------------|--------------------------------|
| `POST` | `/users/signup`   | Register a new user.           |
| `POST` | `/users/login`    | Log in an existing user.       |
| `POST` | `/expenses`       | Create a new expense.          |
| `GET`  | `/expenses`       | Get all expenses for the user. |
| `PATCH`| `/expenses/:id`   | Update an existing expense.    |
| `DELETE`| `/expenses/:id` | Delete an expense.             |


## Project Structure

The project is organized into the following main directories:

- **`src`**: Contains the backend source code.
  - **`user`**: User-related modules (controller, service, schema).
  - **`expense`**: Expense-related modules.
  - **`guards`**: Authentication middleware.
  - **`types`**: Custom TypeScript type definitions.
- **`public`**: Contains the frontend files (HTML, CSS, JavaScript).

