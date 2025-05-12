import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SocialLoginCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleSocialLogin = () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const refresh = params.get('refresh');

      console.log('토큰:', token); // 디버깅용
      console.log('리프레시:', refresh); // 디버깅용

      if (token && refresh) {
        // 토큰 저장
        sessionStorage.setItem('accessToken', token);
        sessionStorage.setItem('refreshToken', refresh);
        setTimeout(() => {
          // 지연 후 리다이렉트 (토큰 저장 시간 확보)
          navigate('/main');
        }, 500);
      } else {
        // 토큰이 없으면 로그인 페이지로
        navigate('/login');
      }
    };
    handleSocialLogin();
  }, [navigate]);

  // 컴포넌트는 반드시 무언가를 반환해야 함
  return <div>소셜 로그인 처리 중...</div>;
}

export default SocialLoginCallback;
