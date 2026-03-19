# Testing Guide for Document Review Management System

## Quick Start

### Prerequisites
- Backend running on port 5000
- Frontend running on port 3000
- MongoDB running and seeded with reviewers

### Start Services
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

---

## Test Case 1: Creating Document with Reviewers (No Duplicates)

### Test: Prevent Null and Duplicate Reviewer IDs

**Step 1:** Open Dashboard → Click "Create Document"

**Step 2:** Fill in form:
- Title: "Budget Review Q1"
- Select 3-4 reviewers
- Submit

**Expected Result:**
- ✅ Document created with status "IN_REVIEW"
- ✅ All reviewers have PENDING reviews created
- ✅ No duplicate key errors in console
- ✅ Document appears in dashboard

**Validation:**
- Go to Dashboard → See document in list
- Click document → See all reviewers listed
- Each reviewer should have exactly one PENDING review

---

## Test Case 2: Reviewer Approves Document

### Test: Status Update Logic - Single Approval

**Step 1:** Go to Reviewer View → Select a reviewer

**Step 2:** Click "Approve" on the Budget Review document

**Step 3:** Confirm action

**Expected Result:**
- ✅ Button shows disabled after approval
- ✅ Status changes to "APPROVED" for that reviewer
- ✅ Document still shows "IN_REVIEW" (other reviewers pending)
- ✅ No error messages

**Verify:**
- Go back to document → See reviewer marked as APPROVED
- Action log shows the approval

---

## Test Case 3: All Reviewers Approve (Document = APPROVED)

### Test: Status Update Logic - All Approved

**Prerequisites:** Document has 3 reviewers, 1 approved

**Step 1:** Switch to 2nd reviewer in Reviewer View

**Step 2:** Approve the document

**Step 3:** Switch to 3rd reviewer

**Step 4:** Approve the document

**Expected Result:**
- ✅ After 1st approval: Document still "IN_REVIEW"
- ✅ After 2nd approval: Document still "IN_REVIEW"
- ✅ After 3rd approval: **Document status changes to "APPROVED"**
- ✅ All buttons disabled for all reviewers
- ✅ Dashboard shows document as "APPROVED"

**Verify:**
- Dashboard → Document shows green "APPROVED" badge
- Reviewer View → All reviewers show "APPROVED" status

---

## Test Case 4: Any Reviewer Rejects (Document = REJECTED)

### Test: Status Update Logic - One Rejection

**Prerequisites:** Document has 3 reviewers, 0-2 approved

**Step 1:** Switch to a reviewer with PENDING status

**Step 2:** Click "Reject" on the document

**Step 3:** Confirm action

**Expected Result:**
- ✅ **Document status IMMEDIATELY changes to "REJECTED"**
- ✅ Even other pending reviewers cannot change this
- ✅ Buttons disabled for the rejecting reviewer
- ✅ Dashboard shows document as "REJECTED" (red badge)

**Verify:**
- All reviewers see document status as "REJECTED"
- Even un-reviewed reviewers cannot approve to override rejection
- Action log shows the rejection

---

## Test Case 5: Prevent Double Submission

### Test: Cannot Submit Twice

**Step 1:** Go to Reviewer View → Select a reviewer

**Step 2:** Approve a document

**Step 3:** Try to click "Reject" button (should be disabled)

**Expected Result:**
- ✅ Approve button disabled
- ✅ Reject button disabled
- ✅ Message shows "Decision already submitted: APPROVED"
- ✅ If trying to force submit: Error message "Cannot update review."

**Verify:**
- No request sent to backend when clicking disabled button
- UI clearly shows the decision is final

---

## Test Case 6: Error Handling - Invalid Reviewers

### Test: Cannot Create with Invalid Reviewer IDs

**Step 1:** Go to Create Document

**Step 2:** Try to submit with:
- Empty reviewer list: Success (creates DRAFT)
- Invalid reviewer IDs: Error shown

**Expected Result:**
- ✅ Error message: "One or more reviewer IDs do not exist"
- ✅ Document not created
- ✅ Status code 400

---

## Test Case 7: Empty Reviewer List

### Test: Document Without Reviewers

**Step 1:** Create document with NO reviewers selected

**Expected Result:**
- ✅ Document created with status "DRAFT"
- ✅ No reviews created
- ✅ Can manually assign reviewers later (if implemented)

---

## Test Case 8: Dashboard Metrics

### Test: Verify Dashboard Calculations

**Prerequisites:** 
- 5 documents created
- Various statuses (Draft, Pending, Approved, Rejected)

**Check Dashboard Shows:**
- ✅ Total Documents: 5
- ✅ Status breakdown:
  - DRAFT: X
  - IN_REVIEW: X
  - APPROVED: X
  - REJECTED: X
- ✅ Total Reviewers: 5
- ✅ Pending Reviewers: [Accurate count of unique reviewers with PENDING reviews]
- ✅ List of Pending Reviewers: [Names without duplicates]

---

## Test Case 9: Reviewer View - Assigned Documents

### Test: Reviewer Sees Only Assigned Documents

**Step 1:** Select "Alice Johnson" in Reviewer View

**Step 2:** Create 3 documents:
- Doc 1: Assign to Alice only
- Doc 2: Assign to Alice + Bob
- Doc 3: Assign to Bob + Charlie

**Expected Result:**
- ✅ Alice sees 2 documents (Doc 1 and Doc 2)
- ✅ Bob doesn't see Doc 1
- ✅ Statistics show correct counts

---

## Test Case 10: Activity Log

### Test: Track All Review Actions

**Step 1:** Perform several review actions:
- Review 1: Approve
- Review 2: Reject
- Review 3: Approve

**Step 2:** Go to Activities page

**Expected Result:**
- ✅ All 3 actions appear with timestamps
- ✅ Messages show: "[Reviewer Name] approved/rejected [Document Title]"
- ✅ Newest actions appear first

---

## API Testing (cURL / Postman)

### Test 1: Create Document with Reviews
```bash
curl -X POST http://localhost:5000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Document",
    "reviewerIds": ["<reviewer1_id>", "<reviewer2_id>"]
  }'

Expected: 201 Created
Response includes document._id and status "IN_REVIEW"
```

### Test 2: Update Review Status
```bash
curl -X PUT http://localhost:5000/api/reviews/<review_id> \
  -H "Content-Type: application/json" \
  -d '{"status": "APPROVED"}'

Expected: 200 OK
Response includes updated review and document with new status
```

### Test 3: Get Reviewer Documents
```bash
curl http://localhost:5000/api/reviewers/<reviewer_id>/documents

Expected: 200 OK
Response: Array of reviews for that reviewer
```

### Test 4: Get Document with Reviews
```bash
curl http://localhost:5000/api/documents/<document_id>

Expected: 200 OK
Response: { document: {...}, reviews: [{...}] }
```

---

## Browser Console Checks

### Check for Errors
1. Open DevTools (F12)
2. Go to Console tab
3. Perform actions
4. **Expected:** No 404 or 5xx errors
5. **Check:** Network tab shows 200 and 201 responses

### Check Component State
1. Go to React DevTools
2. Select ReviewerView component
3. **Verify:** State reflects correct reviews status
4. Go to ReviewPage component
5. **Verify:** myReview status matches what's shown

---

## Stress Tests

### Test 1: Multiple Quick Approvals
- Create document with 5 reviewers
- Rapidly click Approve for each
- **Expected:** No duplicate submissions, all succeed

### Test 2: Create Many Documents
- Create 10 documents with different reviewer combinations
- **Expected:** No duplicate key errors, all created successfully

### Test 3: Status Cascade
- Create document with Pending reviews
- Approve reviewers 1-4
- On reviewer 5: Should show IN_REVIEW until rejected or approved
- **Expected:** Status updates correctly at each step

---

## Expected Error Handling

### Try These Invalid Scenarios

| Scenario | Expected Response |
|----------|------------------|
| Create with null title | 400 - "Document title is required" |
| Create with empty reviewers list | 201 - Document created with DRAFT status |
| Update review with invalid ID | 404 - "Review not found" |
| Update review that's already decided | 400 - "Cannot update review" |
| Create with duplicate reviewer | 400 - "Duplicate reviewer IDs" |
| Create with non-existent reviewer | 400 - "One or more reviewer IDs do not exist" |
| Submit invalid status | 400 - "Status must be APPROVED or REJECTED" |

---

## Performance Baseline

- **Document Creation:** <1 second
- **Review Update:** <1 second
- **Dashboard Load:** <2 seconds
- **Reviewer View Load:** <2 seconds
- **No memory leaks:** Check DevTools Memory after multiple actions

---

## Cleanup & Reset

**If you want to start fresh:**

1. Delete the MongoDB database:
```bash
# Open MongoDB shell
mongo

# Run these commands
use document-review
db.documents.deleteMany({})
db.reviews.deleteMany({})
db.activities.deleteMany({})
```

2. Restart backend (will reseed with sample data)
```bash
npm start
```

---

## Success Criteria

All tests pass when:

✅ No duplicate key errors in any operation  
✅ Document status updates correctly based on review decisions  
✅ UI buttons disable appropriately  
✅ Error messages are clear and helpful  
✅ Dashboard metrics are accurate  
✅ Activity log tracks all actions  
✅ No data integrity issues  
✅ Performance metrics met  

---

## Troubleshooting

### Issue: "Duplicate Key Error"
**Fix:** Check that reviewerIds don't contain null values or duplicates
**Solution:** This should be prevented by the validation now

### Issue: Document status not updating
**Fix:** Refresh the page to reload from database
**Check:** Verify all reviews were created in MongoDB

### Issue: Buttons not disabling
**Fix:** Clear browser cache (Ctrl+Shift+Delete)
**Check:** Verify review status is actually "PENDING" vs other

### Issue: Activities not showing
**Fix:** Restart backend
**Check:** Verify ActivityLog collection is created

