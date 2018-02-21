export const base = '/api';

export const users = {
  base: '/users',
  checkLogin: {
    base: '/check-login',
    method: 'get'
  },
  checkEmail: {
    base: '/check-email',
    method: 'get'
  },
  register: {
    base: '/register',
    method: 'post'
  },
  login: {
    base: '/login',
    method: 'post',
    session: true
  },
  confirmRegister: {
    base: '/confirm-register',
    method: 'get'
  },
  sendOneMore: {
    base: '/send-one-more',
    method: 'get',
    session: true
  },
  forgotPassword: {
    base: '/forgot-password',
    method: 'get'
  },
  resetPassword: {
    base: '/reset-password',
    method: 'post'
  },
  logout: {
    base: '/logout',
    method: 'get',
    session: true
  },
  changePassword: {
    base: '/change-password',
    method: 'post',
    auth: true
  }
};

export const user = {
  base: '/user',
  uploadAvatar: {
    base: '/upload-avatar',
    method: 'post',
    auth: true,
    files: {
      type: 'single',
      opts: ['avatar']
    }
  },
  changeAvatar: {
    base: '/change-avatar',
    method: 'put',
    auth: true
  },
  getAllAvatars: {
    base: '/get-all-avatars',
    method: 'get',
    auth: true
  }
};

export const avatar = {
  base: '/avatar',
  deleteOne: {
    base: '/delete',
    method: 'delete',
    auth: true
  }
};

export const lang = {
  base: '/lang',
  change: {
    base: '/change',
    method: 'put',
    session: true
  }
};
