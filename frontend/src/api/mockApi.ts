import MockAdapter from 'axios-mock-adapter';
import api from './axiosConfig';

// This sets the mock adapter on the default instance
const mock = new MockAdapter(api, { delayResponse: 500 });

// Mock /auth/login
mock.onPost('/auth/login').reply((config) => {
  const { email, password } = JSON.parse(config.data);
  
  // Fake validation
  if (!email || !password) {
    return [400, { message: 'Email and password are required' }];
  }

  // Determine role based on email for testing
  let role = 'STUDENT';
  if (email.includes('admin') || email.includes('manager')) role = 'MANAGER';
  else if (email.includes('teacher')) role = 'TEACHER';
  else if (email.includes('accountant')) role = 'ACCOUNTANT';

  const user = {
    id: `mock-id-${Date.now()}`,
    email,
    fullName: `Mock ${role.charAt(0) + role.slice(1).toLowerCase()} User`,
    role,
    status: 'ACTIVE'
  };

  return [200, {
    user,
    token: `mock-jwt-token-${role}-${Date.now()}`
  }];
});

// If you need to mock other endpoints later, add them here.
// mock.onGet('/users').reply(200, [...]);

// Pass through all other requests to actual backend (optional)
mock.onAny().passThrough();

console.log('🛠️ Axios Mock Adapter initialized. Mocking /api/auth/login');

export default mock;
