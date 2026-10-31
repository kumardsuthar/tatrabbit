import api from './api';

export const authService = {
  register: async (name, email, password, phone) => {
    const response = await api.post('/auth/register.php', { name, email, password, phone });
    return response.data;
  },

  login: async (email, password, portal = 'user') => {
    const response = await api.post('/auth/login.php', { email, password, portal });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password.php', { email });
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await api.post('/auth/verify-otp.php', { email, otp });
    return response.data;
  },

  resetPassword: async (email, resetToken, newPassword, confirmPassword) => {
    const response = await api.post('/auth/reset-password.php', {
      email,
      reset_token: resetToken,
      new_password: newPassword,
      confirm_password: confirmPassword
    });
    return response.data;
  },

  getProfile: async (customToken = null) => {
    const headers = customToken ? { Authorization: `Bearer ${customToken}` } : {};
    const response = await api.get('/auth/profile.php', { headers });
    return response.data;
  }
};


