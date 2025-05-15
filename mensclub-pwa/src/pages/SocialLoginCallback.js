import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SocialLoginCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleSocialLogin = () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const refresh = params.get('refresh');

      console.log('토큰:', token);
      console.log('리프레시:', refresh);

      if (token && refresh) {
        // 토큰 저장
        sessionStorage.setItem('accessToken', token);
        sessionStorage.setItem('refreshToken', refresh);

        // 저장 확인
        const savedToken = sessionStorage.getItem('accessToken');
        console.log('저장된 토큰 확인:', savedToken);

        if (savedToken) {
          navigate('/main');
        } else {
          alert('로그인 정보 저장에 실패했습니다.');
          navigate('/');
        }
      } else {
        // 토큰이 없으면 로그인 페이지로
        navigate('/');
      }
    };

    handleSocialLogin();
  }, [navigate]);

  // 컴포넌트는 반드시 무언가를 반환해야 함
  return <div>소셜 로그인 처리 중...</div>;
}

export default SocialLoginCallback;
