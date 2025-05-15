import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SocialLoginCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleSocialLogin = () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const refresh = params.get('refresh');

      console.log('토큰 확인:', token ? '있음' : '없음');

      if (token && refresh) {
        // 토큰 저장
        sessionStorage.setItem('accessToken', token);
        sessionStorage.setItem('refreshToken', refresh);

        // 저장 확인
        const savedToken = sessionStorage.getItem('accessToken');
        console.log('저장된 토큰 확인:', savedToken);

        if (savedToken) {
          setTimeout(() => {
            navigate('/main');
          });
        } else {
          alert('로그인 정보 저장에 실패했습니다.');
          navigate('/');
        }
      } else {
        // 토큰이 없으면 로그인 페이지로
        navigate('/');
      }
      // 직접 URL 변경으로 시도 (navigate 대신)
      //   window.location.href = '/main';
      // } else {
      //   console.log('토큰 없음, 로그인 페이지로 이동');
      //   window.location.href = '/';
      // }
    };

    handleSocialLogin();
  }, [navigate]);

  // 컴포넌트는 반드시 무언가를 반환해야 함
  return <div>소셜 로그인 처리 중...</div>;
}

export default SocialLoginCallback;
