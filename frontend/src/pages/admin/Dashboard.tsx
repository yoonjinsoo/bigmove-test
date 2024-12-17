import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

interface UserStats {
  total_users: number;
  social_stats: {
    [key: string]: number;
  };
  recent_users: {
    id: number;
    email: string;
    name: string;
    provider: string;
    created_at: string;
    is_active: boolean;
  }[];
}

const AdminDashboard = () => {
  const { token } = useAuthStore();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        if (!token) {
          setError('로그인이 필요합니다');
          return;
        }

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/admin/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setUserStats(response.data);
        setError('');
      } catch (err: any) {
        console.error('Dashboard error:', err.response?.data || err);
        setError(err.response?.data?.detail || '데이터 로딩 중 오류가 발생했습니다');
      }
    };

    fetchUserStats();
  }, [token]);

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  if (!userStats) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="flex-1 min-h-screen" style={{ paddingTop: '80px' }}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#4ECDC4] text-center mb-8">관리자 대시보드</h1>
        
        <div className="max-w-7xl mx-auto">
          {/* 통계 카드 섹션 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#2F2F2F] p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-[#4ECDC4]">전체 회원 수</h2>
              <p className="text-3xl font-bold text-white">{userStats.total_users}명</p>
            </div>

            <div className="md:col-span-2 bg-[#2F2F2F] p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-[#4ECDC4]">소셜 로그인 통계</h2>
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(userStats.social_stats).map(([provider, count]) => (
                  <div key={provider} className="text-center">
                    <h3 className="text-gray-300 mb-2">
                      {provider === 'email' ? '이메일' :
                       provider === 'google' ? '구글' :
                       provider === 'kakao' ? '카카오' : '네이버'}
                    </h3>
                    <p className="text-2xl font-bold text-white">{count}명</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 최근 가입 회원 테이블 */}
          <div className="bg-[#2F2F2F] p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-[#4ECDC4]">최근 가입 회원</h2>
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300">이름</th>
                    <th className="text-left py-3 px-4 text-gray-300">이메일</th>
                    <th className="text-left py-3 px-4 text-gray-300">가입경로</th>
                    <th className="text-left py-3 px-4 text-gray-300">가입일</th>
                    <th className="text-left py-3 px-4 text-gray-300">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {userStats.recent_users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-700">
                      <td className="py-3 px-4 text-white">{user.name}</td>
                      <td className="py-3 px-4 text-gray-300">{user.email}</td>
                      <td className="py-3 px-4 text-gray-300">
                        {user.provider === 'email' ? '이메일' :
                         user.provider === 'google' ? '구글' :
                         user.provider === 'kakao' ? '카카오' : '네이버'}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-sm
                          ${user.is_active ? 
                            'bg-green-900 text-green-300' : 
                            'bg-red-900 text-red-300'}`}>
                          {user.is_active ? '활성' : '비활성'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 