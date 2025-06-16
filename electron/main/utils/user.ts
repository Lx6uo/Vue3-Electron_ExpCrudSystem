import { userInfo } from 'os';

/**
 * 获取当前Windows用户名
 * @returns {string} 当前用户名
 */
export function getCurrentWindowsUser(): string {
  try {
    const user = userInfo();
    return user.username || 'Unknown';
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return 'Unknown';
  }
}

/**
 * 获取当前用户的详细信息
 * @returns {object} 用户详细信息
 */
export function getCurrentUserInfo() {
  try {
    const user = userInfo();
    return {
      username: user.username || 'Unknown',
      uid: user.uid,
      gid: user.gid,
      shell: user.shell,
      homedir: user.homedir
    };
  } catch (error) {
    console.error('获取用户详细信息失败:', error);
    return {
      username: 'Unknown',
      uid: -1,
      gid: -1,
      shell: '',
      homedir: ''
    };
  }
}