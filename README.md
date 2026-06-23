# CodeVector Backend Task (Node.js Implementation)

## Setup

1. **Database Setup**
   Ensure you have a PostgreSQL database running (e.g., Supabase, Neon, or local).
   Create the tables and indexes by executing `init.sql` against your database.

2. **Environment Variables**
   Open the `.env` file and set the `DATABASE_URL` variable to your PostgreSQL connection string.
   ```
   DATABASE_URL=postgresql://user:password@host:port/dbname
   ```

3. **Install Dependencies**
   Run the following command to install required Node.js packages:
   ```bash
   npm install
   ```

## Running the Application

1. **Seed the Database**
   To quickly generate and insert 200,000 mock products:
   ```bash
   npm run seed
   ```

2. **Start the API Server**
   Start the Express server:
   ```bash
   npm start
   ```

   The API will be available at:
   - `http://127.0.0.1:3000/api/products`
