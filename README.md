# Document Review Management System

A full-stack MERN application for managing document reviews with dashboards, reviewer tracking, and activity logs.

## Tech Stack
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- Frontend: React (functional components with hooks, React Router)
- API calls: Axios
- Styling: Basic CSS

## Backend

### Setup
1. Navigate to backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Start the server: `npm start`

The server will run on port 5000 and connect to MongoDB (default: mongodb://localhost:27017/document-review).

### Models
- **Document**: title (String), status (Enum: DRAFT, IN_REVIEW, APPROVED, REJECTED), createdAt (Date)
- **Reviewer**: name (String)
- **Review**: documentId (ObjectId ref Document), reviewerId (ObjectId ref Reviewer), status (Enum: PENDING, APPROVED, REJECTED)
- **ActivityLog**: message (String), timestamp (Date)

### APIs
- GET /api/documents: Get all documents
- GET /api/documents/:id: Get document details with reviewers
- POST /api/documents: Create new document (body: { title, reviewerIds })
- POST /api/reviews/:reviewId/action: Update review status (body: { status: "APPROVED" or "REJECTED" })
- GET /api/dashboard: Get dashboard data
- GET /api/reviewers: Get all reviewers with stats
- GET /api/activities: Get recent activity logs

### Database Design
One document has many reviews. One reviewer can review many documents. Document status is calculated based on reviews: REJECTED if any review is REJECTED, APPROVED if all are APPROVED, else IN_REVIEW. Activities are logged on review actions.

### Core Logic
When updating a review, the document status is recalculated and an activity log is added.

## Frontend

### Setup
1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the app: `npm start`

The app will run on port 3000.

### Pages
- **Dashboard**: Cards for totals, table of documents with filter/search, pending reviewers
- **Document Review Page**: Document details, reviewer list with progress, approve/reject buttons with confirmation
- **Create Document Page**: Form to create document and assign reviewers
- **Reviewer Insights Page**: Table of reviewers with assigned/pending counts
- **Activity Page**: List of recent activity logs

### Behavior
- Navigation via React Router
- Clicking document → Review Page
- Approve/Reject with confirmation popup
- Hardcoded reviewer ID for actions
- Success alerts on actions

## Running the Application
1. Ensure MongoDB is running locally.
2. Start backend: `cd backend && npm start`
3. Start frontend: `cd frontend && npm start`
4. Open browser to http://localhost:3000