# Test Scenarios: Class Management & Enrollment Validation

## Test Scenarios Overview

### Test Categories Covered:
- **Class State Transition Tests**
- **Class Deletion Validation Tests**
- **Enrollment Validation Tests**
- **Edge Case Tests**

---

## 1. Class State Transition Tests

### 1.1 Valid State Transitions

#### Test: UPCOMING → ONGOING Transition
- **Description**: Test valid transition from UPCOMING to ONGOING status
- **Preconditions**: Class exists with status = UPCOMING
- **Action**: Call updateClassStatus with status = ONGOING
- **Expected Result**: Status changes to ONGOING, success response
- **API Endpoint**: PATCH /api/classes/{id}/status?status=ONGOING

#### Test: UPCOMING → CANCELLED Transition
- **Description**: Test valid transition from UPCOMING to CANCELLED status
- **Preconditions**: Class exists with status = UPCOMING
- **Action**: Call updateClassStatus with status = CANCELLED
- **Expected Result**: Status changes to CANCELLED, success response
- **API Endpoint**: PATCH /api/classes/{id}/status?status=CANCELLED

#### Test: ONGOING → COMPLETED Transition
- **Description**: Test valid transition from ONGOING to COMPLETED status
- **Preconditions**: Class exists with status = ONGOING
- **Action**: Call updateClassStatus with status = COMPLETED
- **Expected Result**: Status changes to COMPLETED, success response
- **API Endpoint**: PATCH /api/classes/{id}/status?status=COMPLETED

#### Test: ONGOING → CANCELLED Transition
- **Description**: Test valid transition from ONGOING to CANCELLED status
- **Preconditions**: Class exists with status = ONGOING
- **Action**: Call updateClassStatus with status = CANCELLED
- **Expected Result**: Status changes to CANCELLED, success response
- **API Endpoint**: PATCH /api/classes/{id}/status?status=CANCELLED

### 1.2 Invalid State Transitions

#### Test: COMPLETED → ONGOING Transition (Invalid)
- **Description**: Test invalid transition from COMPLETED to ONGOING
- **Preconditions**: Class exists with status = COMPLETED
- **Action**: Call updateClassStatus with status = ONGOING
- **Expected Result**: throws InvalidClassStatusException with message "Cannot change status from COMPLETED"
- **HTTP Status**: 400 Bad Request
- **API Endpoint**: PATCH /api/classes/{id}/status?status=ONGOING

#### Test: CANCELLED → UPCOMING Transition (Invalid)
- **Description**: Test invalid transition from CANCELLED to UPCOMING
- **Preconditions**: Class exists with status = CANCELLED
- **Action**: Call updateClassStatus with status = UPCOMING
- **Expected Result**: throws InvalidClassStatusException with message "Cannot change status from CANCELLED"
- **HTTP Status**: 400 Bad Request
- **API Endpoint**: PATCH /api/classes/{id}/status?status=UPCOMING

#### Test: UPCOMING → COMPLETED Transition (Invalid)
- **Description**: Test invalid direct transition from UPCOMING to COMPLETED
- **Preconditions**: Class exists with status = UPCOMING
- **Action**: Call updateClassStatus with status = COMPLETED
- **Expected Result**: throws InvalidClassStatusException with allowed transitions listed
- **HTTP Status**: 400 Bad Request
- **API Endpoint**: PATCH /api/classes/{id}/status?status=COMPLETED

#### Test: No Status Change (Same Status)
- **Description**: Test updating to same status (no change needed)
- **Preconditions**: Class exists with status = UPCOMING
- **Action**: Call updateClassStatus with status = UPCOMING
- **Expected Result**: No exception thrown, status remains UPCOMING
- **API Endpoint**: PATCH /api/classes/{id}/status?status=UPCOMING

---

## 2. Class Deletion Validation Tests

### 2.1 Valid Deletion Scenarios

#### Test: Delete Empty UPCOMING Class
- **Description**: Test deletion of UPCOMING class with no enrollments
- **Preconditions**: Class exists with status = UPCOMING, no enrollments, startDate in future
- **Action**: Call DELETE /api/classes/{id}
- **Expected Result**: Class deleted successfully, 204 No Content response
- **API Endpoint**: DELETE /api/classes/{id}

#### Test: Delete Class with Past Start Date but No Active Enrollments
- **Description**: Test deletion of class that has started but no active enrollments
- **Preconditions**: Class exists with startDate < today, but no ACTIVE/PENDING enrollments
- **Action**: Call DELETE /api/classes/{id}
- **Expected Result**: Class deleted successfully, 204 No Content response
- **API Endpoint**: DELETE /api/classes/{id}

### 2.2 Invalid Deletion Scenarios

#### Test: Delete Class with Active Enrollments
- **Description**: Test deletion of class with ACTIVE enrollments
- **Preconditions**: Class exists with > 0 ACTIVE/PENDING enrollments
- **Action**: Call DELETE /api/classes/{id}
- **Expected Result**: throws ClassDeletionException with enrollment count
- **HTTP Status**: 409 Conflict
- **API Endpoint**: DELETE /api/classes/{id}

#### Test: Delete Class That Has Started
- **Description**: Test deletion of class with startDate < today
- **Preconditions**: Class exists with startDate < today (regardless of enrollment count)
- **Action**: Call DELETE /api/classes/{id}
- **Expected Result**: throws ClassDeletionException with message "Cannot delete class that has already started"
- **HTTP Status**: 409 Conflict
- **API Endpoint**: DELETE /api/classes/{id}

---

## 3. Enrollment Validation Tests

### 3.1 Valid Enrollment Scenarios

#### Test: Enroll in UPCOMING Class
- **Description**: Test student enrollment in UPCOMING class
- **Preconditions**: Class exists with status = UPCOMING, capacity available
- **Action**: Call enrollment API for student
- **Expected Result**: Enrollment created with status = PENDING
- **API Endpoint**: POST /api/enrollments

#### Test: Enroll in ONGOING Class
- **Description**: Test student enrollment in ONGOING class
- **Preconditions**: Class exists with status = ONGOING, capacity available
- **Action**: Call enrollment API for student
- **Expected Result**: Enrollment created with status = PENDING
- **API Endpoint**: POST /api/enrollments

#### Test: Multiple Enrollments within Capacity
- **Description**: Test multiple student enrollments up to capacity limit
- **Preconditions**: Class has maxStudents = 10, currently 8 ACTIVE/PENDING enrollments
- **Action**: Enroll 2 more students
- **Expected Result**: 2 new enrollments created successfully
- **API Endpoint**: POST /api/enrollments (called twice)

### 3.2 Invalid Enrollment Scenarios

#### Test: Enroll in COMPLETED Class
- **Description**: Test attempt to enroll in COMPLETED class
- **Preconditions**: Class exists with status = COMPLETED
- **Action**: Call enrollment API for student
- **Expected Result**: throws InvalidClassStatusException
- **HTTP Status**: 400 Bad Request
- **API Endpoint**: POST /api/enrollments

#### Test: Enroll in CANCELLED Class
- **Description**: Test attempt to enroll in CANCELLED class
- **Preconditions**: Class exists with status = CANCELLED
- **Action**: Call enrollment API for student
- **Expected Result**: throws InvalidClassStatusException
- **HTTP Status**: 400 Bad Request
- **API Endpoint**: POST /api/enrollments

#### Test: Enroll in Ended Class
- **Description**: Test attempt to enroll in class with past end date
- **Preconditions**: Class exists with endDate < today
- **Action**: Call enrollment API for student
- **Expected Result**: throws InvalidClassStatusException with end date info
- **HTTP Status**: 400 Bad Request
- **API Endpoint**: POST /api/enrollments

#### Test: Enroll Beyond Capacity
- **Description**: Test attempt to enroll beyond class capacity
- **Preconditions**: Class has maxStudents = 10, currently 10 ACTIVE/PENDING enrollments
- **Action**: Call enrollment API for another student
- **Expected Result**: throws RuntimeException with capacity info
- **HTTP Status**: 400 Bad Request
- **API Endpoint**: POST /api/enrollments

#### Test: Duplicate Enrollment
- **Description**: Test attempt to enroll same student twice in same class
- **Preconditions**: Student already enrolled in class
- **Action**: Call enrollment API same student again
- **Expected Result**: throws RuntimeException with "already enrolled" message
- **HTTP Status**: 400 Bad Request
- **API Endpoint**: POST /api/enrollments

---

## 4. Edge Case Tests

### 4.1 Capacity Management Tests

#### Test: Reduce Capacity Below Current Enrollments (Update Class)
- **Description**: Test attempting to reduce class capacity below current enrollment count
- **Preconditions**: Class has maxStudents = 10, 8 ACTIVE/PENDING enrollments
- **Action**: Update class with maxStudents = 5
- **Expected Result**: throws IllegalArgumentException with capacity message
- **HTTP Status**: 400 Bad Request
- **API Endpoint**: PUT /api/classes/{id}

#### Test: Increase Capacity (Update Class)
- **Description**: Test increasing class capacity
- **Preconditions**: Class has maxStudents = 10, 8 ACTIVE/PENDING enrollments
- **Action**: Update class with maxStudents = 15
- **Expected Result**: Capacity updated successfully, new enrollments allowed
- **API Endpoint**: PUT /api/classes/{id}

### 4.2 Date Boundary Tests

#### Test: Enroll on Class End Date
- **Description**: Test enrollment on exact class end date
- **Preconditions**: Class has endDate = today
- **Action**: Call enrollment API for student
- **Expected Result**: Should be allowed (end date check uses isBefore())
- **API Endpoint**: POST /api/enrollments

#### Test: Enroll After Class End Date
- **Description**: Test enrollment day after class end date
- **Preconditions**: Class has endDate = yesterday
- **Action**: Call enrollment API for student
- **Expected Result**: throws InvalidClassStatusException
- **HTTP Status**: 400 Bad Request
- **API Endpoint**: POST /api/enrollments

### 4.3 Null/Empty Data Tests

#### Test: Update Class with Null Status
- **Description**: Test updating class with null status parameter
- **Preconditions**: Class exists
- **Action**: Update class with ClassRequest having null status
- **Expected Result**: Status should remain unchanged, other updates applied
- **API Endpoint**: PUT /api/classes/{id}

#### Test: Update Class with Empty Name
- **Description**: Test updating class with empty string name
- **Preconditions**: Class exists
- **Action**: Update class with ClassRequest having empty name
- **Expected Result**: Name should remain unchanged (blank check prevents update)
- **API Endpoint**: PUT /api/classes/{id}

---

## 5. Integration Tests

### 5.1 Complete Class Lifecycle Test
- **Description**: Test complete class lifecycle from creation to completion
- **Steps**:
  1. Create class with status = UPCOMING
  2. Enroll students (should succeed)
  3. Update status to ONGOING (should succeed)
  4. Enroll more students (should succeed if capacity available)
  5. Update status to COMPLETED (should succeed)
  6. Attempt to enroll more students (should fail)
  7. Attempt to delete class (should fail - completed status)
- **Expected Result**: All steps should follow expected validation rules

### 5.2 Class Cancellation Flow Test
- **Description**: Test class cancellation flow and impact on enrollments
- **Steps**:
  1. Create class with status = UPCOMING
  2. Enroll students (should succeed)
  3. Update status to CANCELLED (should succeed)
  4. Attempt to enroll more students (should fail)
  5. Attempt to update cancelled class (should work for other fields)
  6. Attempt to change status from CANCELLED (should fail)
- **Expected Result**: Cancellation should prevent new enrollments but allow other updates

---

## Test Data Requirements

### Required Test Entities:
- **Course**: At least 1 course for class creation
- **Room**: Optional room for classes
- **Branch**: Optional branch for classes
- **Teacher**: Optional teacher for classes
- **Student**: Multiple students for enrollment testing
- **Class**: Various class instances with different statuses and dates

### Test Date Scenarios:
- Future dates for upcoming classes
- Current dates for ongoing classes
- Past dates for completed/ended classes
- Edge dates (today, yesterday, tomorrow)

### Test Capacity Scenarios:
- Classes with capacity 1, 5, 10, 20 students
- Partial capacity utilization
- Full capacity scenarios
- Over-capacity validation scenarios