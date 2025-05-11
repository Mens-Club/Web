import { useEffect } from 'react';

function SocialLoginCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const refresh = params.get('refresh');

    console.log('토큰:', token); // 디버깅용
    console.log('리프레시:', refresh); // 디버깅용

    if (token) {
      // 토큰 저장
      sessionStorage.setItem('accessToken', token);
      if (refresh) {
        sessionStorage.setItem('refreshToken', refresh);
      }

      // 지연 후 리다이렉트 (토큰 저장 시간 확보)
      setTimeout(() => {
        window.location.href = '/main';
      }, 500);
    } else {
      // 토큰이 없으면 로그인 페이지로
      window.location.href = '/login';
    }
  }, []);
}

export default SocialLoginCallback;
