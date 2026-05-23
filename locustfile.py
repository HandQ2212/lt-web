"""
Locust stress test for the ELC backend behind Cloudflare + NGINX.

Default target:
    https://elcbackend.handq2212.site

Quick start:
    pip install locust
    locust -f locustfile.py --host https://elcbackend.handq2212.site

Safe stress profiles:
    ELC_STRESS_SHAPE=1
    ELC_STRESS_PROFILE=normal   # normal | high | spike | recovery
    locust -f .\\locustfile.py

Recommended environment variables:
    ELC_HOST=https://elcbackend.handq2212.site
    ELC_ORIGIN=https://elc.handq2212.site
    ELC_ENABLE_MUTATIONS=0
    ELC_ENABLE_AUTH_SIDE_EFFECTS=0
    ELC_RATE_LIMIT_MODE=0
    ELC_RATE_LIMIT_PATH=/api/branches
    ELC_RATE_LIMIT_PACING_SECONDS=0.1
    ELC_STRESS_SHAPE=0
    ELC_STRESS_PROFILE=normal

    ELC_MANAGER_EMAIL=manager@elc.com
    ELC_MANAGER_PASSWORD=manager
    ELC_TEACHER_EMAIL=teacher@gmail.com
    ELC_TEACHER_PASSWORD=teacher
    ELC_STUDENT_EMAIL=r@gmail.com
    ELC_STUDENT_PASSWORD=12345678nH!
    ELC_ACCOUNTANT_EMAIL=accountant@gmail.com
    ELC_ACCOUNTANT_PASSWORD=accountant
    ELC_LEAD_EMAIL=i@gmail.com
    ELC_LEAD_PASSWORD=12345678nH!

Optional seed IDs to improve coverage:
    ELC_BRANCH_ID, ELC_COURSE_ID, ELC_LEVEL_ID, ELC_CLASS_ID, ELC_ROOM_ID,
    ELC_TEACHER_ID, ELC_STUDENT_ID, ELC_ENROLLMENT_ID, ELC_ASSIGNMENT_ID,
    ELC_SUBMISSION_ID, ELC_INVOICE_ID, ELC_LEAD_ID, ELC_NOTIFICATION_ID,
    ELC_SCHEDULE_ID

Notes:
    - Read endpoints are exercised by default.
    - Mutating endpoints are disabled by default to avoid polluting production data.
    - When a route needs an ID, the script first tries env vars, then auto-discovers
      IDs from list endpoints.
    - Set ELC_RATE_LIMIT_MODE=1 to run a focused Cloudflare rate-limit probe.
    - Set ELC_RATE_LIMIT_PACING_SECONDS to control each probe user's request interval.
    - Set ELC_STRESS_SHAPE=1 to run a staged stress test profile automatically.
"""

from __future__ import annotations

import os
import random
import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, Iterable, List, Optional

from locust import HttpUser, LoadTestShape, between, constant_pacing, tag, task
from locust.exception import StopUser


def env(name: str, default: Optional[str] = None) -> Optional[str]:
    value = os.getenv(name)
    if value is None:
        return default
    value = value.strip()
    return value or default


def env_bool(name: str, default: bool = False) -> bool:
    value = env(name)
    if value is None:
        return default
    return value.lower() in {"1", "true", "yes", "on"}


def env_float(name: str, default: float) -> float:
    value = env(name)
    if value is None:
        return default
    try:
        return float(value)
    except ValueError:
        return default


def env_int(name: str, default: int) -> int:
    value = env(name)
    if value is None:
        return default
    try:
        return int(value)
    except ValueError:
        return default


def has_role_credentials(role: str) -> bool:
    role = role.upper()
    return bool(env(f"ELC_{role}_EMAIL") and env(f"ELC_{role}_PASSWORD"))


RATE_LIMIT_MODE = env_bool("ELC_RATE_LIMIT_MODE", False)
STRESS_SHAPE_MODE = env_bool("ELC_STRESS_SHAPE", False)
STRESS_PROFILE = (env("ELC_STRESS_PROFILE", "normal") or "normal").lower()


def now_z() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def random_phone() -> str:
    return "09" + "".join(random.choice("0123456789") for _ in range(8))


def as_list(payload: Any) -> List[Dict[str, Any]]:
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    if isinstance(payload, dict):
        for key in ("content", "data", "items", "results"):
            value = payload.get(key)
            if isinstance(value, list):
                return [item for item in value if isinstance(item, dict)]
    return []


def first_id(items: Iterable[Dict[str, Any]]) -> Optional[str]:
    for item in items:
        value = item.get("id")
        if value:
            return str(value)
    return None


class SharedState:
    ids: Dict[str, str] = {}

    @classmethod
    def get(cls, key: str) -> Optional[str]:
        return env(f"ELC_{key.upper()}_ID") or cls.ids.get(key)

    @classmethod
    def set(cls, key: str, value: Any) -> None:
        if value:
            cls.ids[key] = str(value)


class BaseApiUser(HttpUser):
    abstract = True
    wait_time = between(1, 3)
    host = env("ELC_HOST", "https://elcbackend.handq2212.site")

    default_headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Origin": env("ELC_ORIGIN", "https://elc.handq2212.site"),
        "Referer": f"{env('ELC_ORIGIN', 'https://elc.handq2212.site').rstrip('/')}/",
        "User-Agent": "locust-elc-stresstest/1.0",
    }

    enable_mutations = env_bool("ELC_ENABLE_MUTATIONS", False)
    enable_auth_side_effects = env_bool("ELC_ENABLE_AUTH_SIDE_EFFECTS", False)

    role_name = "generic"
    token: Optional[str] = None
    refresh_token: Optional[str] = None
    current_user_id: Optional[str] = None

    def on_start(self) -> None:
        self.client.headers.update(self.default_headers)
        self.prime_public_ids()

    def credential(self, field: str) -> Optional[str]:
        return env(f"ELC_{self.role_name.upper()}_{field}") or env(f"ELC_{field}")

    def auth_headers(self) -> Dict[str, str]:
        headers: Dict[str, str] = {}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def request(
        self,
        method: str,
        path: str,
        *,
        name: Optional[str] = None,
        expected: Iterable[int] = (200,),
        allow_status: Iterable[int] = (),
        **kwargs: Any,
    ):
        accepted = set(expected) | set(allow_status)
        headers = kwargs.pop("headers", {})
        if self.token:
            headers = {**self.auth_headers(), **headers}
        return self.client.request(
            method,
            path,
            name=name or path,
            headers=headers,
            catch_response=True,
            **kwargs,
        )

    def json_or_none(self, response) -> Optional[Any]:
        try:
            return response.json()
        except Exception:
            return None

    def checked_request(
        self,
        method: str,
        path: str,
        *,
        name: Optional[str] = None,
        expected: Iterable[int] = (200,),
        allow_status: Iterable[int] = (),
        **kwargs: Any,
    ) -> Optional[Any]:
        accepted = set(expected) | set(allow_status)
        with self.request(method, path, name=name, expected=expected, allow_status=allow_status, **kwargs) as response:
            if response.status_code in accepted:
                response.success()
            else:
                response.failure(f"{method} {path} -> {response.status_code}: {response.text[:240]}")
            return self.json_or_none(response)

    def maybe_request(
        self,
        method: str,
        path: str,
        *,
        name: Optional[str] = None,
        expected: Iterable[int] = (200,),
        allow_status: Iterable[int] = (400, 401, 403, 404, 409, 422),
        **kwargs: Any,
    ) -> Optional[Any]:
        return self.checked_request(
            method,
            path,
            name=name,
            expected=expected,
            allow_status=allow_status,
            **kwargs,
        )

    def prime_public_ids(self) -> None:
        if not SharedState.get("branch"):
            data = self.maybe_request("GET", "/api/branches", name="GET /api/branches")
            SharedState.set("branch", first_id(as_list(data)))

        if not SharedState.get("course"):
            data = self.maybe_request("GET", "/api/courses", name="GET /api/courses")
            courses = as_list(data)
            SharedState.set("course", first_id(courses))
            for course in courses:
                levels = course.get("levels")
                if isinstance(levels, list):
                    SharedState.set("level", first_id(levels))
                    if SharedState.get("level"):
                        break

        if not SharedState.get("level"):
            data = self.maybe_request("GET", "/api/levels", name="GET /api/levels")
            SharedState.set("level", first_id(as_list(data)))

        if not SharedState.get("teacher"):
            data = self.maybe_request("GET", "/api/public/teachers", name="GET /api/public/teachers")
            SharedState.set("teacher", first_id(as_list(data)))

    def prime_authenticated_ids(self) -> None:
        if not SharedState.get("class"):
            data = self.maybe_request("GET", "/api/classes", name="GET /api/classes")
            SharedState.set("class", first_id(as_list(data)))

        if not SharedState.get("room"):
            data = self.maybe_request("GET", "/api/rooms", name="GET /api/rooms")
            SharedState.set("room", first_id(as_list(data)))

        if not SharedState.get("student") or not SharedState.get("teacher"):
            data = self.maybe_request("GET", "/api/users?size=50", name="GET /api/users")
            for user in as_list(data):
                role = str(user.get("role", "")).upper()
                if role == "STUDENT" and not SharedState.get("student"):
                    SharedState.set("student", user.get("id"))
                if role == "TEACHER" and not SharedState.get("teacher"):
                    SharedState.set("teacher", user.get("id"))

        if not SharedState.get("teacher"):
            data = self.maybe_request("GET", "/api/users/teachers", name="GET /api/users/teachers")
            SharedState.set("teacher", first_id(as_list(data)))

        class_id = SharedState.get("class")
        if class_id and not SharedState.get("schedule"):
            schedules = self.maybe_request("GET", f"/api/classes/{class_id}/schedule", name="GET /api/classes/:id/schedule")
            SharedState.set("schedule", first_id(as_list(schedules)))

        if class_id and not SharedState.get("enrollment"):
            enrollments = self.maybe_request(
                "GET",
                f"/api/enrollments/class/{class_id}",
                name="GET /api/enrollments/class/:id",
            )
            SharedState.set("enrollment", first_id(as_list(enrollments)))

        if class_id and not SharedState.get("assignment"):
            assignments = self.maybe_request(
                "GET",
                f"/api/assignments/class/{class_id}",
                name="GET /api/assignments/class/:id",
            )
            SharedState.set("assignment", first_id(as_list(assignments)))

        assignment_id = SharedState.get("assignment")
        if assignment_id and not SharedState.get("submission"):
            submissions = self.maybe_request(
                "GET",
                f"/api/submissions/assignment/{assignment_id}",
                name="GET /api/submissions/assignment/:id",
            )
            SharedState.set("submission", first_id(as_list(submissions)))

        if not SharedState.get("invoice"):
            invoices = self.maybe_request("GET", "/api/invoices", name="GET /api/invoices")
            SharedState.set("invoice", first_id(as_list(invoices)))

        if not SharedState.get("lead"):
            leads = self.maybe_request("GET", "/api/leads?page=0&size=20", name="GET /api/leads")
            SharedState.set("lead", first_id(as_list(leads)))

        if not SharedState.get("notification"):
            notifications = self.maybe_request("GET", "/api/notifications", name="GET /api/notifications")
            SharedState.set("notification", first_id(as_list(notifications)))

    def login(self) -> None:
        email = self.credential("EMAIL")
        password = self.credential("PASSWORD")
        if not email or not password:
            raise StopUser(f"Missing credentials for role {self.role_name}")

        payload = {"email": email, "password": password}
        data = self.checked_request(
            "POST",
            "/api/auth/login",
            name="POST /api/auth/login",
            json=payload,
        )
        if not isinstance(data, dict):
            raise StopUser("Login failed: no JSON body returned")

        self.token = data.get("accessToken")
        self.refresh_token = data.get("refreshToken")
        user = data.get("user") or {}
        if isinstance(user, dict):
            self.current_user_id = str(user.get("id")) if user.get("id") else None
            if user.get("id"):
                SharedState.set("student", user.get("id") if str(user.get("role", "")).upper() == "STUDENT" else SharedState.get("student"))
        if not self.token:
            raise StopUser("Login failed: access token missing")

        self.prime_authenticated_ids()

    def create_public_lead_payload(self) -> Dict[str, Any]:
        course_id = SharedState.get("course")
        branch_id = SharedState.get("branch")
        unique = uuid.uuid4().hex[:10]
        payload: Dict[str, Any] = {
            "fullName": f"Locust Public {unique}",
            "email": f"locust-public-{unique}@example.com",
            "phone": random_phone(),
            "source": "WEBSITE",
            "preferredLevel": "BEGINNER",
            "notes": "generated by locust public lead flow",
        }
        if course_id:
            payload["courseIds"] = [course_id]
        if branch_id:
            payload["branchId"] = branch_id
        return payload

    def create_register_payload(self) -> Dict[str, Any]:
        branch_id = SharedState.get("branch")
        unique = uuid.uuid4().hex[:10]
        payload: Dict[str, Any] = {
            "email": f"locust-register-{unique}@example.com",
            "password": "Locust123!",
            "fullName": f"Locust Register {unique}",
            "phone": random_phone(),
            "address": "Stress test registration",
        }
        if branch_id:
            payload["branchId"] = branch_id
        return payload


class PublicApiUser(BaseApiUser):
    abstract = RATE_LIMIT_MODE
    weight = 2

    @tag("public", "catalog")
    @task(6)
    def browse_public_catalog(self) -> None:
        self.checked_request("GET", "/api/branches", name="GET /api/branches")
        courses = self.checked_request("GET", "/api/courses", name="GET /api/courses")
        self.checked_request("GET", "/api/levels", name="GET /api/levels")
        self.checked_request("GET", "/api/public/teachers", name="GET /api/public/teachers")

        course_id = SharedState.get("course") or first_id(as_list(courses))
        if course_id:
            SharedState.set("course", course_id)
            self.maybe_request("GET", f"/api/courses/{course_id}", name="GET /api/courses/:id")

        level_id = SharedState.get("level")
        if level_id:
            self.maybe_request("GET", f"/api/levels/{level_id}", name="GET /api/levels/:id")

    @tag("public", "auth")
    @task(2)
    def login_refresh_flow(self) -> None:
        email = env("ELC_PUBLIC_LOGIN_EMAIL") or env("ELC_EMAIL") or env("ELC_LEAD_EMAIL")
        password = env("ELC_PUBLIC_LOGIN_PASSWORD") or env("ELC_PASSWORD") or env("ELC_LEAD_PASSWORD")
        if not email or not password:
            return

        data = self.checked_request(
            "POST",
            "/api/auth/login",
            name="POST /api/auth/login",
            json={"email": email, "password": password},
        )
        if not isinstance(data, dict):
            return

        refresh_token = data.get("refreshToken")
        access_token = data.get("accessToken")
        if refresh_token:
            self.maybe_request(
                "POST",
                "/api/auth/refresh",
                name="POST /api/auth/refresh",
                json={"refreshToken": refresh_token},
            )
        if refresh_token and access_token:
            self.maybe_request(
                "POST",
                "/api/auth/logout",
                name="POST /api/auth/logout",
                headers={"Authorization": f"Bearer {access_token}"},
                json={"refreshToken": refresh_token},
            )

    @tag("public", "side-effects")
    @task(1)
    def public_write_flows(self) -> None:
        if self.enable_mutations:
            self.maybe_request(
                "POST",
                "/api/public/leads",
                name="POST /api/public/leads",
                expected=(200, 201),
                json=self.create_public_lead_payload(),
            )

        if self.enable_auth_side_effects:
            self.maybe_request(
                "POST",
                "/api/auth/register",
                name="POST /api/auth/register",
                expected=(200, 201),
                json=self.create_register_payload(),
            )
            self.maybe_request(
                "POST",
                "/api/auth/forgot-password",
                name="POST /api/auth/forgot-password",
                json={"email": env("ELC_FORGOT_PASSWORD_EMAIL", "noreply@example.com")},
            )
            self.maybe_request(
                "POST",
                "/api/auth/reset-password",
                name="POST /api/auth/reset-password",
                json={"token": env("ELC_RESET_TOKEN", "dummy-reset-token"), "newPassword": "Locust123!"},
            )


class AuthenticatedApiUser(BaseApiUser):
    abstract = True

    def on_start(self) -> None:
        super().on_start()
        self.login()

    def own_student_id(self) -> Optional[str]:
        return env("ELC_STUDENT_ID") or self.current_user_id or SharedState.get("student")

    @tag("auth", "profile")
    @task(3)
    def profile_endpoints(self) -> None:
        self.checked_request("GET", "/api/profile", name="GET /api/profile")
        if self.enable_mutations:
            self.maybe_request(
                "PUT",
                "/api/profile",
                name="PUT /api/profile",
                json={
                    "fullName": f"Locust {self.role_name.title()}",
                    "phone": random_phone(),
                    "address": f"updated by locust {self.role_name}",
                },
            )

    @tag("auth", "notifications")
    @task(2)
    def notification_endpoints(self) -> None:
        self.checked_request("GET", "/api/notifications", name="GET /api/notifications")
        self.checked_request("GET", "/api/notifications/unread-count", name="GET /api/notifications/unread-count")

        if self.enable_mutations:
            notification_id = SharedState.get("notification")
            if notification_id:
                self.maybe_request(
                    "PUT",
                    f"/api/notifications/{notification_id}/read",
                    name="PUT /api/notifications/:id/read",
                )
            self.maybe_request("PATCH", "/api/notifications/read-all", name="PATCH /api/notifications/read-all")

    @tag("auth", "announcements")
    @task(2)
    def announcement_endpoints(self) -> None:
        self.checked_request("GET", "/api/announcements?page=0&size=20", name="GET /api/announcements")
        self.maybe_request("GET", "/api/announcements/sent?page=0&size=20", name="GET /api/announcements/sent")

        if self.enable_mutations:
            payload = {
                "title": f"Locust {uuid.uuid4().hex[:6]}",
                "message": "Stress-test announcement",
                "type": "GENERAL",
                "scope": "ALL",
                "expiresAt": (datetime.now(timezone.utc) + timedelta(days=7)).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
            }
            self.maybe_request("POST", "/api/announcements", name="POST /api/announcements", expected=(200, 201), json=payload)

    @tag("auth", "readonly-core")
    @task(4)
    def readonly_core_endpoints(self) -> None:
        self.checked_request("GET", "/api/classes", name="GET /api/classes")
        self.checked_request("GET", "/api/rooms", name="GET /api/rooms")
        self.checked_request("GET", "/api/users/teachers", name="GET /api/users/teachers")

        class_id = SharedState.get("class")
        if class_id:
            self.maybe_request("GET", f"/api/classes/{class_id}", name="GET /api/classes/:id")
            self.maybe_request("GET", f"/api/classes/{class_id}/schedule", name="GET /api/classes/:id/schedule")
            self.maybe_request(
                "POST",
                "/api/classes/check-conflict",
                name="POST /api/classes/check-conflict",
                json={
                    "roomId": SharedState.get("room"),
                    "dayOfWeek": "MONDAY",
                    "startTime": "09:00:00",
                    "endTime": "11:00:00",
                },
            )

    @tag("auth", "analytics")
    @task(2)
    def analytics_endpoints(self) -> None:
        self.maybe_request("GET", "/api/analytics/branch-performance", name="GET /api/analytics/branch-performance")
        self.maybe_request("GET", "/api/analytics/revenue", name="GET /api/analytics/revenue")
        self.maybe_request("GET", "/api/analytics/academic", name="GET /api/analytics/academic")
        self.maybe_request("GET", "/api/analytics/dashboard", name="GET /api/analytics/dashboard")
        self.maybe_request("GET", "/api/reports/revenue", name="GET /api/reports/revenue")
        self.maybe_request("GET", "/api/reports/expenses", name="GET /api/reports/expenses")
        self.maybe_request("GET", "/api/reports/profit-loss", name="GET /api/reports/profit-loss")
        self.maybe_request("GET", "/api/reports/conversion", name="GET /api/reports/conversion")
        self.maybe_request("GET", "/api/reports/top-courses", name="GET /api/reports/top-courses")
        self.maybe_request("GET", "/api/reports/churn-rate", name="GET /api/reports/churn-rate")


class ManagerUser(AuthenticatedApiUser):
    abstract = not has_role_credentials("manager")
    weight = 2
    role_name = "manager"

    @tag("manager", "users")
    @task(4)
    def user_management_reads(self) -> None:
        self.checked_request("GET", "/api/users?page=0&size=20", name="GET /api/users")

    @tag("manager", "lms")
    @task(4)
    def lms_reads(self) -> None:
        class_id = SharedState.get("class")
        student_id = SharedState.get("student")
        enrollment_id = SharedState.get("enrollment")
        assignment_id = SharedState.get("assignment")

        if class_id:
            self.maybe_request("GET", f"/api/enrollments/class/{class_id}", name="GET /api/enrollments/class/:id")
            self.maybe_request("GET", f"/api/attendance/{class_id}", name="GET /api/attendance/:classId")
            self.maybe_request("GET", f"/api/assignments/class/{class_id}", name="GET /api/assignments/class/:id")

        if student_id:
            self.maybe_request("GET", f"/api/enrollments/student/{student_id}", name="GET /api/enrollments/student/:id")
            self.maybe_request(
                "GET",
                f"/api/attendance/report/monthly?studentId={student_id}&year={date.today().year}&month={date.today().month}",
                name="GET /api/attendance/report/monthly",
            )

        if enrollment_id:
            self.maybe_request("GET", f"/api/results/enrollment/{enrollment_id}", name="GET /api/results/enrollment/:id")
            self.maybe_request("GET", f"/api/attendance/enrollment/{enrollment_id}", name="GET /api/attendance/enrollment/:id")

        if assignment_id:
            self.maybe_request("GET", f"/api/submissions/assignment/{assignment_id}", name="GET /api/submissions/assignment/:id")

    @tag("manager", "leads")
    @task(3)
    def lead_endpoints(self) -> None:
        self.checked_request("GET", "/api/leads?page=0&size=20", name="GET /api/leads")
        self.maybe_request("GET", "/api/leads/me", name="GET /api/leads/me")

    @tag("manager", "finance")
    @task(4)
    def finance_reads(self) -> None:
        invoice_id = SharedState.get("invoice")
        self.checked_request("GET", "/api/invoices", name="GET /api/invoices")
        self.maybe_request("GET", "/api/invoices/debt", name="GET /api/invoices/debt")
        self.maybe_request("GET", "/api/transactions", name="GET /api/transactions")
        self.maybe_request("GET", "/api/expenses", name="GET /api/expenses")
        if invoice_id:
            self.maybe_request("GET", f"/api/invoices/{invoice_id}", name="GET /api/invoices/:id")
            self.maybe_request("GET", f"/api/payments/invoice/{invoice_id}", name="GET /api/payments/invoice/:id")

    @tag("manager", "mutations")
    @task(1)
    def safe_mutations(self) -> None:
        if not self.enable_mutations:
            return

        class_id = SharedState.get("class")
        course_id = SharedState.get("course")
        level_id = SharedState.get("level")
        room_id = SharedState.get("room")
        teacher_id = SharedState.get("teacher")
        branch_id = SharedState.get("branch")
        student_id = SharedState.get("student")
        enrollment_id = SharedState.get("enrollment")
        invoice_id = SharedState.get("invoice")
        lead_id = SharedState.get("lead")

        unique = uuid.uuid4().hex[:8]

        self.maybe_request(
            "POST",
            "/api/users",
            name="POST /api/users",
            expected=(200, 201),
            json={
                "email": f"locust-user-{unique}@example.com",
                "password": "Locust123!",
                "fullName": f"Locust User {unique}",
                "phone": random_phone(),
                "role": "LEAD",
                "branchId": branch_id,
            },
        )

        created_course = self.maybe_request(
            "POST",
            "/api/courses",
            name="POST /api/courses",
            expected=(200, 201),
            json={"name": f"Locust Course {unique}", "description": "Created by locust"},
        )
        created_course_id = created_course.get("id") if isinstance(created_course, dict) else None
        if created_course_id:
            self.maybe_request(
                "PUT",
                f"/api/courses/{created_course_id}",
                name="PUT /api/courses/:id",
                json={"name": f"Locust Course {unique} Updated", "description": "Updated by locust"},
            )
            self.maybe_request("DELETE", f"/api/courses/{created_course_id}", name="DELETE /api/courses/:id")

        if course_id:
            created_level = self.maybe_request(
                "POST",
                "/api/levels",
                name="POST /api/levels",
                expected=(200, 201),
                json={
                    "courseId": course_id,
                    "code": f"LOC-{unique}".upper(),
                    "name": f"Locust Level {unique}",
                    "description": "Created by locust",
                    "displayOrder": random.randint(10, 99),
                    "basePrice": 1000000,
                    "durationWeeks": 8,
                    "isActive": True,
                },
            )
            created_level_id = created_level.get("id") if isinstance(created_level, dict) else None
            if created_level_id:
                self.maybe_request(
                    "PUT",
                    f"/api/levels/{created_level_id}",
                    name="PUT /api/levels/:id",
                    json={"name": f"Locust Level {unique} Updated", "basePrice": 1200000},
                )
                self.maybe_request("DELETE", f"/api/levels/{created_level_id}", name="DELETE /api/levels/:id")

        if level_id and room_id and teacher_id and branch_id:
            created_class = self.maybe_request(
                "POST",
                "/api/classes",
                name="POST /api/classes",
                expected=(200, 201),
                json={
                    "levelId": level_id,
                    "roomId": room_id,
                    "teacherId": teacher_id,
                    "branchId": branch_id,
                    "name": f"Locust Class {unique}",
                    "status": "PLANNED",
                    "startDate": (date.today() + timedelta(days=7)).isoformat(),
                    "endDate": (date.today() + timedelta(days=70)).isoformat(),
                    "maxStudents": 20,
                },
            )
            created_class_id = created_class.get("id") if isinstance(created_class, dict) else None
            if created_class_id:
                self.maybe_request(
                    "PUT",
                    f"/api/classes/{created_class_id}",
                    name="PUT /api/classes/:id",
                    json={"name": f"Locust Class {unique} Updated", "maxStudents": 25},
                )
                self.maybe_request(
                    "PATCH",
                    f"/api/classes/{created_class_id}/status?status=ACTIVE",
                    name="PATCH /api/classes/:id/status",
                )
                created_schedule = self.maybe_request(
                    "POST",
                    f"/api/classes/{created_class_id}/schedule",
                    name="POST /api/classes/:id/schedule",
                    expected=(200, 201),
                    json={
                        "roomId": room_id,
                        "dayOfWeek": "MONDAY",
                        "startTime": "09:00:00",
                        "endTime": "11:00:00",
                    },
                )
                created_schedule_id = created_schedule.get("id") if isinstance(created_schedule, dict) else None
                if created_schedule_id:
                    self.maybe_request(
                        "PUT",
                        f"/api/classes/{created_class_id}/schedule/{created_schedule_id}",
                        name="PUT /api/classes/:id/schedule/:scheduleId",
                        json={
                            "roomId": room_id,
                            "dayOfWeek": "TUESDAY",
                            "startTime": "13:00:00",
                            "endTime": "15:00:00",
                        },
                    )
                    self.maybe_request(
                        "DELETE",
                        f"/api/classes/{created_class_id}/schedule/{created_schedule_id}",
                        name="DELETE /api/classes/:id/schedule/:scheduleId",
                    )
                self.maybe_request("DELETE", f"/api/classes/{created_class_id}", name="DELETE /api/classes/:id")

        if student_id and class_id:
            created_enrollment = self.maybe_request(
                "POST",
                "/api/enrollments",
                name="POST /api/enrollments",
                expected=(200, 201),
                json={
                    "studentId": student_id,
                    "classId": class_id,
                    "enrollmentDate": date.today().isoformat(),
                    "status": "ACTIVE",
                },
            )
            created_enrollment_id = created_enrollment.get("id") if isinstance(created_enrollment, dict) else None
            if created_enrollment_id:
                self.maybe_request(
                    "PATCH",
                    f"/api/enrollments/{created_enrollment_id}/status?status=ACTIVE",
                    name="PATCH /api/enrollments/:id/status",
                )
                self.maybe_request(
                    "PATCH",
                    f"/api/enrollments/{created_enrollment_id}/class",
                    name="PATCH /api/enrollments/:id/class",
                    json={"targetClassId": class_id},
                )

        if enrollment_id:
            created_invoice = self.maybe_request(
                "POST",
                "/api/invoices",
                name="POST /api/invoices",
                expected=(200, 201),
                json={
                    "enrollmentId": enrollment_id,
                    "totalAmount": 5000000,
                    "discountAmount": 0,
                    "finalAmount": 5000000,
                    "dueDate": (date.today() + timedelta(days=14)).isoformat(),
                    "status": "UNPAID",
                },
            )
            created_invoice_id = created_invoice.get("id") if isinstance(created_invoice, dict) else None
            if created_invoice_id:
                self.maybe_request(
                    "PATCH",
                    f"/api/invoices/{created_invoice_id}/status?status=PAID",
                    name="PATCH /api/invoices/:id/status",
                )
                self.maybe_request(
                    "POST",
                    f"/api/invoices/{created_invoice_id}/refund",
                    name="POST /api/invoices/:id/refund",
                    json={"amount": 100000, "reason": "locust refund test"},
                )
                self.maybe_request("DELETE", f"/api/invoices/{created_invoice_id}", name="DELETE /api/invoices/:id")

        if invoice_id:
            self.maybe_request(
                "POST",
                "/api/payments",
                name="POST /api/payments",
                expected=(200, 201),
                json={
                    "invoiceId": invoice_id,
                    "amount": 100000,
                    "paymentMethod": "CASH",
                    "paymentDate": now_z(),
                    "notes": "locust payment test",
                },
            )
            self.maybe_request(
                "POST",
                "/api/v1/payment/create-link",
                name="POST /api/v1/payment/create-link",
                expected=(200, 201),
                json={"amount": 100000, "invoiceId": invoice_id},
            )

        self.maybe_request(
            "POST",
            "/api/expenses",
            name="POST /api/expenses",
            expected=(200, 201),
            json={
                "category": "TESTING",
                "amount": 10000,
                "expenseDate": date.today().isoformat(),
                "vendor": "Locust",
                "notes": "stress test expense",
            },
        )

        if class_id:
            created_assignment = self.maybe_request(
                "POST",
                "/api/assignments",
                name="POST /api/assignments",
                expected=(200, 201),
                json={
                    "classId": class_id,
                    "title": f"Locust Assignment {unique}",
                    "description": "Created by locust",
                    "dueDate": (datetime.now(timezone.utc) + timedelta(days=5)).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
                    "externalLink": "https://example.com/locust",
                },
            )
            created_assignment_id = created_assignment.get("id") if isinstance(created_assignment, dict) else None
            if created_assignment_id:
                SharedState.set("assignment", created_assignment_id)

        if lead_id:
            self.maybe_request(
                "PUT",
                f"/api/leads/{lead_id}/status",
                name="PUT /api/leads/:id/status",
                json={"status": "CONTACTED"},
            )
            self.maybe_request("POST", f"/api/leads/{lead_id}/consulting", name="POST /api/leads/:id/consulting")
            if class_id:
                self.maybe_request(
                    "POST",
                    f"/api/leads/{lead_id}/agree?classId={class_id}",
                    name="POST /api/leads/:id/agree",
                )
            self.maybe_request("POST", f"/api/leads/{lead_id}/confirm-cash", name="POST /api/leads/:id/confirm-cash")
            self.maybe_request("POST", f"/api/leads/{lead_id}/reject", name="POST /api/leads/:id/reject")
            self.maybe_request("POST", f"/api/leads/{lead_id}/convert", name="POST /api/leads/:id/convert")


class TeacherUser(AuthenticatedApiUser):
    abstract = not has_role_credentials("teacher")
    weight = 1
    role_name = "teacher"

    @tag("teacher", "teaching")
    @task(5)
    def teaching_endpoints(self) -> None:
        class_id = SharedState.get("class")
        assignment_id = SharedState.get("assignment")
        submission_id = SharedState.get("submission")
        enrollment_id = SharedState.get("enrollment")

        self.maybe_request("GET", "/api/assignments/mine", name="GET /api/assignments/mine")
        self.maybe_request("GET", "/api/submissions/me", name="GET /api/submissions/me")

        if class_id:
            self.maybe_request("GET", f"/api/assignments/class/{class_id}", name="GET /api/assignments/class/:id")
            self.maybe_request("GET", f"/api/attendance/{class_id}", name="GET /api/attendance/:classId")

        if assignment_id:
            self.maybe_request("GET", f"/api/submissions/assignment/{assignment_id}", name="GET /api/submissions/assignment/:id")

        if enrollment_id:
            self.maybe_request("GET", f"/api/results/enrollment/{enrollment_id}", name="GET /api/results/enrollment/:id")

        if self.enable_mutations and assignment_id:
            self.maybe_request(
                "POST",
                "/api/submissions/submit",
                name="POST /api/submissions/submit",
                expected=(200, 201),
                json={"assignmentId": assignment_id, "content": "locust teacher submission probe"},
            )
        if self.enable_mutations and submission_id:
            self.maybe_request(
                "PUT",
                f"/api/submissions/{submission_id}/grade",
                name="PUT /api/submissions/:id/grade",
                json={"grade": 8.5, "feedback": "graded by locust"},
            )
        if self.enable_mutations and enrollment_id:
            self.maybe_request(
                "POST",
                "/api/attendance",
                name="POST /api/attendance",
                expected=(200, 201),
                json={
                    "enrollmentId": enrollment_id,
                    "attendanceDate": date.today().isoformat(),
                    "status": "PRESENT",
                    "notes": "teacher locust test",
                },
            )


class StudentUser(AuthenticatedApiUser):
    abstract = not has_role_credentials("student")
    weight = 1
    role_name = "student"

    @tag("student", "learning")
    @task(5)
    def learning_endpoints(self) -> None:
        student_id = self.own_student_id()
        enrollment_id = SharedState.get("enrollment")
        assignment_id = SharedState.get("assignment")

        self.maybe_request("GET", "/api/assignments/mine", name="GET /api/assignments/mine")
        self.maybe_request("GET", "/api/submissions/me", name="GET /api/submissions/me")

        if student_id:
            self.maybe_request("GET", f"/api/enrollments/student/{student_id}", name="GET /api/enrollments/student/:id")

        if enrollment_id:
            self.maybe_request("GET", f"/api/results/enrollment/{enrollment_id}", name="GET /api/results/enrollment/:id")
            self.maybe_request("GET", f"/api/attendance/enrollment/{enrollment_id}", name="GET /api/attendance/enrollment/:id")

        if assignment_id and self.enable_mutations:
            self.maybe_request(
                "POST",
                "/api/submissions/submit",
                name="POST /api/submissions/submit",
                expected=(200, 201),
                json={"assignmentId": assignment_id, "content": "locust student submission"},
            )


class AccountantUser(AuthenticatedApiUser):
    abstract = not has_role_credentials("accountant")
    weight = 1
    role_name = "accountant"

    @tag("accountant", "finance")
    @task(6)
    def accountant_finance_endpoints(self) -> None:
        invoice_id = SharedState.get("invoice")

        self.checked_request("GET", "/api/invoices", name="GET /api/invoices")
        self.maybe_request("GET", "/api/invoices/debt", name="GET /api/invoices/debt")
        self.maybe_request("GET", "/api/transactions", name="GET /api/transactions")
        self.maybe_request("GET", "/api/expenses", name="GET /api/expenses")
        self.maybe_request("GET", "/api/analytics/revenue", name="GET /api/analytics/revenue")
        self.maybe_request("GET", "/api/reports/profit-loss", name="GET /api/reports/profit-loss")

        if invoice_id:
            self.maybe_request("GET", f"/api/invoices/{invoice_id}", name="GET /api/invoices/:id")
            self.maybe_request("GET", f"/api/payments/invoice/{invoice_id}", name="GET /api/payments/invoice/:id")


class LeadUser(AuthenticatedApiUser):
    abstract = not has_role_credentials("lead")
    weight = 1
    role_name = "lead"

    @tag("lead", "crm")
    @task(5)
    def lead_endpoints(self) -> None:
        self.maybe_request("GET", "/api/leads/me", name="GET /api/leads/me")

        if self.enable_mutations:
            course_id = SharedState.get("course")
            class_id = SharedState.get("class")
            if course_id:
                self.maybe_request(
                    "POST",
                    "/api/leads/me/interests",
                    name="POST /api/leads/me/interests",
                    expected=(200, 201),
                    json={"courseIds": [course_id], "notes": "locust interest"},
                )
            if class_id:
                self.maybe_request(
                    "POST",
                    f"/api/leads/me/interest-class?classId={class_id}&notes=locust",
                    name="POST /api/leads/me/interest-class",
                    expected=(200, 201),
                )


class RateLimitProbeUser(HttpUser):
    abstract = not RATE_LIMIT_MODE
    wait_time = constant_pacing(env_float("ELC_RATE_LIMIT_PACING_SECONDS", 0.1))
    host = env("ELC_HOST", "https://elcbackend.handq2212.site")
    weight = 1

    probe_path = env("ELC_RATE_LIMIT_PATH", "/api/branches")
    default_headers = {
        "Accept": "application/json",
        "Origin": env("ELC_ORIGIN", "https://elc.handq2212.site"),
        "Referer": f"{env('ELC_ORIGIN', 'https://elc.handq2212.site').rstrip('/')}/",
        "User-Agent": "locust-elc-rate-limit-probe/1.0",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
    }

    def on_start(self) -> None:
        self.client.headers.update(self.default_headers)

    @tag("rate-limit", "public")
    @task
    def hammer_public_endpoint(self) -> None:
        with self.client.get(self.probe_path, name=f"RATE {self.probe_path}", catch_response=True) as response:
            if response.status_code in (200, 429):
                response.success()
            else:
                response.failure(f"GET {self.probe_path} -> {response.status_code}: {response.text[:240]}")


class SafeStressShape(LoadTestShape):
    """
    Optional staged stress profile for legitimate capacity testing.

    Enable with:
        ELC_STRESS_SHAPE=1
        ELC_STRESS_PROFILE=normal|high|spike|recovery
    """

    abstract = not STRESS_SHAPE_MODE

    profiles = {
        "normal": [
            {"duration": 60, "users": 5, "spawn_rate": 2},
            {"duration": 180, "users": 10, "spawn_rate": 3},
            {"duration": 300, "users": 15, "spawn_rate": 3},
        ],
        "high": [
            {"duration": 60, "users": 10, "spawn_rate": 3},
            {"duration": 180, "users": 20, "spawn_rate": 5},
            {"duration": 300, "users": 35, "spawn_rate": 5},
            {"duration": 420, "users": 50, "spawn_rate": 8},
        ],
        "spike": [
            {"duration": 45, "users": 5, "spawn_rate": 2},
            {"duration": 90, "users": 40, "spawn_rate": 15},
            {"duration": 180, "users": 15, "spawn_rate": 8},
            {"duration": 240, "users": 5, "spawn_rate": 3},
        ],
        "recovery": [
            {"duration": 45, "users": 5, "spawn_rate": 2},
            {"duration": 120, "users": 20, "spawn_rate": 5},
            {"duration": 210, "users": 20, "spawn_rate": 5},
            {"duration": 300, "users": 8, "spawn_rate": 3},
            {"duration": 360, "users": 3, "spawn_rate": 2},
        ],
    }

    def tick(self):
        run_time = self.get_run_time()
        profile_name = STRESS_PROFILE if STRESS_PROFILE in self.profiles else "normal"
        stages = self.profiles[profile_name]

        for stage in stages:
            if run_time < stage["duration"]:
                return stage["users"], stage["spawn_rate"]
        return None
