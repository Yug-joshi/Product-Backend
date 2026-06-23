# Using AI for this Project

For this take-home project, I decided to use AI as programming tool to speed things up and help with a few tricky parts. Here's a quick breakdown of how I split the work.

### My Role: Architecture & Decisions
While AI wrote a lot of the boilerplate, I made the core decisions on how the app should actually work:
- **Choosing Keyset Pagination**: I quickly realized standard `OFFSET` pagination breaks if new products are added while someone is scrolling. I decided to use cursor-based (keyset) pagination instead to make it more robust.
- **Frontend Approach**: I wanted to keep the frontend super lightweight. Instead of setting up a massive React app just for a simple UI, I decided to use plain HTML/JS served directly from Express. 
- **Deployment**: I handled the actual deployment to Render, managing the environment variables and making sure the API endpoints routed correctly in production.

### Where I Used AI
I leaned on AI mainly for execution and things that take too much time to write from scratch:
- **Tricky SQL**: The SQL for the cursor pagination was honestly pretty tough, especially handling tie-breakers when two items have the exact same timestamp. I used AI to help me get the syntax `(created_at < $1 OR (created_at = $1 AND id < $2))` exactly right.
- **Boilerplate & UI**: AI helped me set up the initial Express server and generated the CSS/HTML for the frontend so I could focus purely on the backend API logic.
- **Test Data**: I had the AI write a script to generate thousands of mock products into the database so I could actually test if my pagination worked under load.
- **Cleanup**: Towards the end, I used it to minify my CSS and clean up some messy utility functions so the final code was easier to read.

Overall, using AI let me skip the tedious parts of web dev so I could focus my time on solving the actual database and pagination problems.
