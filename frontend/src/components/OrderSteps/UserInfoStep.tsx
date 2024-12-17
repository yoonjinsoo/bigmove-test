import React from 'react';

interface UserInfoStepProps {
  userId: string;
  setUserId: (id: string) => void;
  nextStep: () => void;
}

const UserInfoStep: React.FC<UserInfoStepProps> = ({ userId, setUserId, nextStep }) => {
  return (
    <div>
      <h2>사용자 정보 입력</h2>
      <div>
        <label>사용자 ID:</label>
        <input type="number" value={userId} onChange={(e) => setUserId(e.target.value)} required />
      </div>
      <button onClick={nextStep}>다음 단계</button>
    </div>
  );
};

export default UserInfoStep;
