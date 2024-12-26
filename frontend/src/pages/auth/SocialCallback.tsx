import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/common/Toast';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';

type SocialProvider = 'google' | 'naver' | 'kakao';

const SocialCallback = () => {
  const { provider } = useParams<{ provider: SocialProvider }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    setTempUserInfo,
    setSocialSignupData,
    setError,
    socialAuth
  } = useAuthStore();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        
        if (!code || !state) {
          console.error('Missing required parameters:', { code, state });
          useAuthStore.getState().setError('소셜 로그인에 필요한 정보가 누락되었습니다.');
          navigate('/auth/login', { replace: true });
          return;
        }

        const response = await api.get(`/api/auth/callback/${provider}?code=${code}&state=${state}`);
        console.log('Callback response:', response.data);

        // 회원가입 응답 처리 (temp_user_info가 있는 경우)
        if ('temp_user_info' in response.data) {
          const { temp_user_info, is_new_user } = response.data;
          if (!temp_user_info.email) {
            throw new Error('필수 사용자 정보가 누락되었습니다.');
          }
          useAuthStore.getState().setTempUserInfo(temp_user_info);
          useAuthStore.getState().setSocialSignupData(response.data);
          navigate('/auth/social-signup', { replace: true });
        }
        // 로그인 응답 처리 (access_token과 user_info가 있는 경우)
        else if ('access_token' in response.data && 'user_info' in response.data) {
          const { access_token, user_info } = response.data;
          if (!user_info || !user_info.email || !user_info.name) {
            throw new Error('필수 사용자 정보가 누락되었습니다.');
          }
          useAuthStore.getState().handleAuthSuccessWithCache(queryClient, {
            token: access_token,
            access_token: access_token,
            user: {
              ...user_info,
              provider: provider
            }
          });
          navigate('/items', { replace: true });
        }
        else {
          throw new Error('잘못된 응답 형식입니다.');
        }
      } catch (error) {
        console.error('Social callback error:', error);
        useAuthStore.getState().setError('소셜 로그인 처리 중 오류가 발생했습니다.');
        navigate('/auth/login', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [location.search]); // 오직 location.search가 변경될 때만 실행

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">소셜 인증 처리 중...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
};

export default SocialCallback;