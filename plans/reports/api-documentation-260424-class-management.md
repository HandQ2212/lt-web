# API Documentation: Class Management & Enrollment Features

## Base URL
```
/api
```

---

## 1. Class Management Endpoints

### 1.1 Get All Classes
**Endpoint**: `GET /api/classes`

**Description**: Retrieve all classes in the system

**Parameters**: None

**Response**:
```json
{
  "status": 200,
  "data": [
    {
      "id": "uuid",
      "name": "Java Programming",
      "courseId": "uuid",
      "courseName": "Java Fundamentals",
      "roomId": "uuid",
      "roomName": "Room 101",
      "teacherId": "uuid",
      "teacherName": "John Doe",
      "branchId": "uuid",
      "branchName": "Main Branch",
      "status": "UPCOMING",
      "startDate": "2024-01-15",
      "endDate": "2024-03-15",
      "maxStudents": 20,
      "schedules": [
        {
          "id": "uuid",
          "classId": "uuid",
          "dayOfWeek": "MONDAY",
          "startTime": "09:00:00",
          "endTime": "11:00:00"
        }
      ]
    }
  ]
}
```

---

### 1.2 Get Class by ID
**Endpoint**: `GET /api/classes/{id}`

**Description**: Retrieve a specific class by its ID

**Parameters**:
- `id` (path, UUID): The unique identifier of the class

**Response**:
```json
{
  "status": 200,
  "data": {
    "id": "uuid",
    "name": "Java Programming",
    "courseId": "uuid",
    "courseName": "Java Fundamentals",
    "roomId": "uuid",
    "roomName": "Room 101",
    "teacherId": "uuid",
    "teacherName": "John Doe",
    "branchId": "uuid",
    "branchName": "Main Branch",
    "status": "UPCOMING",
    "startDate": "2024-01-15",
    "endDate": "2024-03-15",
    "maxStudents": 20,
    "schedules": []
  }
}
```

---

### 1.3 Create Class
**Endpoint**: `POST /api/classes`

**Description**: Create a new class

**Request Body**:
```json
{
  "name": "Java Programming",
  "courseId": "uuid",
  "roomId": "uuid",
  "teacherId": "uuid",
  "branchId": "uuid",
  "status": "UPCOMING",
  "startDate": "2024-01-15",
  "endDate": "2024-03-15",
  "maxStudents": 20
}
```

**Response**:
```json
{
  "status": 201,
  "data": {
    "id": "uuid",
    "name": "Java Programming",
    "courseId": "uuid",
    "courseName": "Java Fundamentals",
    "roomId": "uuid",
    "roomName": "Room 101",
    "teacherId": "uuid",
    "teacherName": "John Doe",
    "branchId": "uuid",
    "branchName": "Main Branch",
    "status": "UPCOMING",
    "startDate": "2024-01-15",
    "endDate": "2024-03-15",
    "maxStudents": 20,
    "schedules": []
  }
}
```

**Error Scenarios**:
- `400 Bad Request`: Invalid request body data
- `404 Not Found`: Course, Room, Teacher, or Branch not found

---

### 1.4 Update Class
**Endpoint**: `PUT /api/classes/{id}`

**Description**: Update an existing class with full validation

**Parameters**:
- `id` (path, UUID): The unique identifier of the class

**Request Body**:
```json
{
  "name": "Advanced Java Programming",
  "courseId": "uuid",
  "roomId": "uuid",
  "teacherId": "uuid",
  "branchId": "uuid",
  "status": "ONGOING",
  "startDate": "2024-01-15",
  "endDate": "2024-03-15",
  "maxStudents": 25
}
```

**Response**:
```json
{
  "status": 200,
  "data": {
    "id": "uuid",
    "name": "Advanced Java Programming",
    "courseId": "uuid",
    "courseName": "Java Fundamentals",
    "roomId": "uuid",
    "roomName": "Room 101",
    "teacherId": "uuid",
    "teacherName": "John Doe",
    "branchId": "uuid",
    "branchName": "Main Branch",
    "status": "ONGOING",
    "startDate": "2024-01-15",
    "endDate": "2024-03-15",
    "maxStudents": 25,
    "schedules": []
  }
}
```

**Validation Rules**:
- `maxStudents` cannot be reduced below current enrollment count
- `status` transitions must follow state machine rules
- Only provided fields are updated (null fields are ignored)

**Error Scenarios**:
- `400 Bad Request`: Invalid request body, invalid status transition, capacity below current enrollment
- `404 Not Found`: Class not found, referenced entities not found

---

### 1.5 Delete Class
**Endpoint**: `DELETE /api/classes/{id}`

**Description**: Delete a class with validation checks

**Parameters**:
- `id` (path, UUID): The unique identifier of the class

**Response**:
```json
{
  "status": 204,
  "data": null
}
```

**Deletion Rules**:
- Cannot delete class with active (ACTIVE/PENDING) enrollments
- Cannot delete class that has already started (startDate < today)

**Error Scenarios**:
- `404 Not Found`: Class not found
- `409 Conflict`: Class has active enrollments or has already started
  ```json
  {
    "status": 409,
    "error": "ClassDeletionException",
    "message": "Cannot delete class with active enrollments. Current active enrollments: 5"
  }
  ```

---

### 1.6 Update Class Status
**Endpoint**: `PATCH /api/classes/{id}/status`

**Description**: Update class status with state transition validation

**Parameters**:
- `id` (path, UUID): The unique identifier of the class
- `status` (query, ClassStatus): The new status to set

**Query Parameters**:
```json
{
  "status": "ONGOING"
}
```

**Response**:
```json
{
  "status": 200,
  "data": {
    "id": "uuid",
    "name": "Java Programming",
    "status": "ONGOING",
    "startDate": "2024-01-15",
    "endDate": "2024-03-15",
    "maxStudents": 20
  }
}
```

**Status Transitions**:
- `UPCOMING` → `ONGOING` or `CANCELLED` ✓
- `ONGOING` → `COMPLETED` or `CANCELLED` ✓
- `COMPLETED` → No changes allowed ✗
- `CANCELLED` → No changes allowed ✗

**Error Scenarios**:
- `400 Bad Request`: Invalid status transition, same status (no change needed)
  ```json
  {
    "status": 400,
    "error": "InvalidClassStatusException",
    "message": "Invalid status transition from UPCOMING to COMPLETED. Allowed transitions: UPCOMING → ONGOING, UPCOMING → CANCELLED"
  }
  ```

---

### 1.7 Get Class Schedules
**Endpoint**: `GET /api/classes/{id}/schedule`

**Description**: Retrieve all schedules for a specific class

**Parameters**:
- `id` (path, UUID): The unique identifier of the class

**Response**:
```json
{
  "status": 200,
  "data": [
    {
      "id": "uuid",
      "classId": "uuid",
      "dayOfWeek": "MONDAY",
      "startTime": "09:00:00",
      "endTime": "11:00:00"
    },
    {
      "id": "uuid",
      "classId": "uuid",
      "dayOfWeek": "WEDNESDAY",
      "startTime": "09:00:00",
      "endTime": "11:00:00"
    }
  ]
}
```

---

### 1.8 Add Class Schedule
**Endpoint**: `POST /api/classes/{id}/schedule`

**Description**: Add a new schedule to a class with conflict checking

**Parameters**:
- `id` (path, UUID): The unique identifier of the class

**Request Body**:
```json
{
  "dayOfWeek": "MONDAY",
  "startTime": "09:00:00",
  "endTime": "11:00:00"
}
```

**Response**:
```json
{
  "status": 201,
  "data": {
    "id": "uuid",
    "classId": "uuid",
    "dayOfWeek": "MONDAY",
    "startTime": "09:00:00",
    "endTime": "11:00:00"
  }
}
```

**Error Scenarios**:
- `400 Bad Request`: Invalid request body, time conflicts
  ```json
  {
    "status": 400,
    "error": "RuntimeException",
    "message": "Schedule conflict detected: Teacher already has another class at this time"
  }
  ```

---

### 1.9 Check Schedule Conflict
**Endpoint**: `POST /api/classes/check-conflict`

**Description**: Check for schedule conflicts based on teacher, room, and time

**Request Body**:
```json
{
  "teacherId": "uuid",
  "roomId": "uuid",
  "dayOfWeek": "MONDAY",
  "startTime": "09:00:00",
  "endTime": "11:00:00"
}
```

**Response**:
```json
{
  "status": 200,
  "data": {
    "hasConflict": false,
    "conflictMessage": null
  }
}
```

**Conflict Response**:
```json
{
  "status": 200,
  "data": {
    "hasConflict": true,
    "conflictMessage": "Teacher John Doe has another class scheduled on Monday 09:00-11:00"
  }
}
```

---

## 2. Enrollment Endpoints

### 2.1 Get Enrollments by Class
**Endpoint**: `GET /api/enrollments/class/{classId}`

**Description**: Retrieve all enrollments for a specific class

**Parameters**:
- `classId` (path, UUID): The unique identifier of the class

**Response**:
```json
{
  "status": 200,
  "data": [
    {
      "id": "uuid",
      "studentId": "uuid",
      "studentName": "John Doe",
      "classId": "uuid",
      "className": "Java Programming",
      "enrollmentDate": "2024-01-10",
      "status": "ACTIVE"
    }
  ]
}
```

---

### 2.2 Get Enrollments by Student
**Endpoint**: `GET /api/enrollments/student/{studentId}`

**Description**: Retrieve all enrollments for a specific student

**Parameters**:
- `studentId` (path, UUID): The unique identifier of the student

**Response**:
```json
{
  "status": 200,
  "data": [
    {
      "id": "uuid",
      "studentId": "uuid",
      "studentName": "John Doe",
      "classId": "uuid",
      "className": "Java Programming",
      "enrollmentDate": "2024-01-10",
      "status": "ACTIVE"
    }
  ]
}
```

---

### 2.3 Enroll Student
**Endpoint**: `POST /api/enrollments`

**Description**: Enroll a student in a class with comprehensive validation

**Request Body**:
```json
{
  "studentId": "uuid",
  "classId": "uuid",
  "enrollmentDate": "2024-01-10",
  "status": "PENDING"
}
```

**Response**:
```json
{
  "status": 201,
  "data": {
    "id": "uuid",
    "studentId": "uuid",
    "studentName": "John Doe",
    "classId": "uuid",
    "className": "Java Programming",
    "enrollmentDate": "2024-01-10",
    "status": "PENDING"
  }
}
```

**Validation Rules**:
- Class status must be `UPCOMING` or `ONGOING`
- Class cannot have ended (endDate must be >= today)
- Class cannot be cancelled
- Student cannot be already enrolled
- Class capacity must not be exceeded

**Error Scenarios**:
- `400 Bad Request`: Invalid request body, validation failures
  ```json
  {
    "status": 400,
    "error": "InvalidClassStatusException",
    "message": "Cannot enroll in class with status: COMPLETED. Enrollment is only allowed for UPCOMING or ONGOING classes."
  }
  ```
  ```json
  {
    "status": 400,
    "error": "RuntimeException",
    "message": "Class is full. Current enrollment: 20, Max capacity: 20"
  }
  ```
  ```json
  {
    "status": 400,
    "error": "RuntimeException",
    "message": "Student is already enrolled in this class"
  }
  ```

---

### 2.4 Update Enrollment Status
**Endpoint**: `PATCH /api/enrollments/{id}/status`

**Description**: Update the status of an existing enrollment

**Parameters**:
- `id` (path, UUID): The unique identifier of the enrollment

**Request Body**:
```json
{
  "status": "ACTIVE"
}
```

**Response**:
```json
{
  "status": 200,
  "data": {
    "id": "uuid",
    "studentId": "uuid",
    "studentName": "John Doe",
    "classId": "uuid",
    "className": "Java Programming",
    "enrollmentDate": "2024-01-10",
    "status": "ACTIVE"
  }
}
```

---

## 3. Enums

### 3.1 ClassStatus
```java
public enum ClassStatus {
  UPCOMING,    // Class scheduled to start in future
  ONGOING,     // Class currently in session
  COMPLETED,   // Class has finished
  CANCELLED    // Class was cancelled
}
```

### 3.2 EnrollmentStatus
```java
public enum EnrollmentStatus {
  PENDING,     // Enrollment approved but not yet active
  ACTIVE,      // Student is currently attending
  COMPLETED,   // Student has completed the class
  DROPPED,     // Student dropped out of the class
  CANCELLED    // Enrollment was cancelled
}
```

---

## 4. Error Responses

### 4.1 InvalidClassStatusException
```json
{
  "status": 400,
  "error": "InvalidClassStatusException",
  "message": "Invalid status transition details..."
}
```

### 4.2 ClassDeletionException
```json
{
  "status": 409,
  "error": "ClassDeletionException",
  "message": "Cannot delete class with active enrollments..."
}
```

### 4.3 RuntimeException (General)
```json
{
  "status": 400,
  "error": "RuntimeException",
  "message": "Descriptive error message..."
}
```

---

## 5. Rate Limiting
- **Class Management**: 100 requests per minute per IP
- **Enrollment Management**: 50 requests per minute per IP
- **Schedule Operations**: 200 requests per minute per IP

---

## 6. Authentication & Authorization
All endpoints require authentication:
- **JWT Token** required in Authorization header
- **Required Roles**: ADMIN, TEACHER, STUDENT (role-based access control varies by endpoint)

---

## 7. Version Information
- **API Version**: 1.0
- **Last Updated**: 2026-04-24