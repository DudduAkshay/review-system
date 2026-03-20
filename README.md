# 📄 Document Review Management System

A full-stack MERN application for managing document reviews with multi-reviewer workflows, dynamic status updates, and a real-time dashboard.

---

## 🚀 Features

* Assign multiple reviewers to a document
* Independent approve/reject actions per reviewer
* Automatic document status calculation:

  * ❌ Rejected → if any reviewer rejects
  * ✅ Approved → if all reviewers approve
  * ⏳ In Review → otherwise
* Dashboard with real-time statistics
* Reviewer insights (assigned & pending counts)
* Activity logging of actions

---

## 🛠️ Tech Stack

**Frontend**

* React (Hooks, React Router)
* Axios
* CSS

**Backend**

* Node.js
* Express.js

**Database**

* MongoDB
* Mongoose

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone <your-repo-link>
cd document_review_management
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file inside `backend/`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/document-review
```

Start backend:

```bash
npm start
```

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

---

### 4. Run MongoDB

Make sure MongoDB is running:

```bash
mongod
```

---

### 5. Open Application

```
http://localhost:3000
```

---

## 📡 API Endpoints

### Documents

* `GET /api/documents` → Get all documents
* `GET /api/documents/:id` → Get document details
* `POST /api/documents` → Create document

### Reviews

* `POST /api/reviews/:reviewId/action` → Approve/Reject

### Dashboard

* `GET /api/dashboard` → Get stats

### Reviewers

* `GET /api/reviewers` → Get reviewers with stats

### Activities

* `GET /api/activities` → Get activity logs

---

## 🧠 Core Logic

Each document is reviewed by multiple reviewers:

* If **any reviewer rejects** → Document = **REJECTED**
* If **all reviewers approve** → Document = **APPROVED**
* Otherwise → Document = **IN REVIEW**

---

## ⚠️ Notes

* MongoDB must be running locally
* Backend runs on port `5000`
* Frontend runs on port `3000`
* Reviewer actions are simulated (no authentication)

---

## 👨‍💻 Author

Akshay Duddu
