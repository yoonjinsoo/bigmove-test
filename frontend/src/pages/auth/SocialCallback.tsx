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
        
        // 디버깅을 위한 상세 로그
        console.log('Authorization attempt:', {
          provider,
          code,
          state: state ? decodeURIComponent(state) : null
        });

        if (!code || !state) {
          throw new Error('소셜 로그인에 필요한 정보가 누락되었습니다.');
        }

        // API 요청 전 헤더 확인
        console.log('API Request:', {
          url: `/api/auth/callback/${provider}`,
          params: { code, state }
        });

        const response = await api.get(`/api/auth/callback/${provider}?code=${code}&state=${state}`);
        
        // 1. API 응답 데이터 확인
        console.log('1. API 응답 원본:', {
          데이터: response.data,
          데이터타입: typeof response.data,
          is_new_user타입: typeof response.data.is_new_user
        });

        if ('temp_user_info' in response.data && response.data.temp_user_info) {
          const { temp_user_info, is_new_user } = response.data;
          
          // 2. 구조분해할당 후 값 확인
          console.log('2. 구조분해할당 결과:', {
            temp_user_info,
            is_new_user,
            is_new_user타입: typeof is_new_user,
            is_new_user값: is_new_user === false ? '명시적false' : 'false가아님'
          });

          // 3. Store 업데이트 전 상태
          console.log('3. Store 업데이트 전:', {
            현재상태: useAuthStore.getState()
          });

          // Store 업데이트
          useAuthStore.getState().setSocialSignupData({
            temp_user_info,
            is_new_user
          });

          // 4. Store 업데이트 후 상태
          console.log('4. Store 업데이트 후:', {
            socialSignupData: useAuthStore.getState().socialSignupData,
            is_new_user값: useAuthStore.getState().socialSignupData?.is_new_user
          });

          // 5. 페이지 이동 직전 최종 확인
          console.log('5. 페이지 이동 직전:', {
            최종is_new_user: useAuthStore.getState().socialSignupData?.is_new_user,
            이동할페이지: '/auth/social-signup'
          });

          navigate('/auth/social-signup', { replace: true });
          return;
        }
        
        if ('access_token' in response.data && 'user_info' in response.data) {
          const { access_token, user_info } = response.data;
          if (!user_info?.email || !user_info?.name) {
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
          return;
        }
        
        throw new Error('잘못된 응답 형식입니다.');
        
      } catch (error) {
        console.error('Social callback error:', error);
        useAuthStore.getState().setError(
          error instanceof Error ? error.message : '소셜 로그인 처리 중 오류가 발생했습니다.'
        );
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