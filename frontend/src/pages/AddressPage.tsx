import React from 'react';
import ProgressBar from '../components/common/ProgressBar';
import AddressStep from '../components/OrderSteps/AddressStep';

const AddressPage: React.FC = () => {
  return (
    <div className="step-container">
      <div className="step-progress-bar">
        <ProgressBar currentStep={6} totalSteps={8} />
      </div>
      <h1 className="step-title">주소 입력</h1>
      <AddressStep />
    </div>
  );
};

export default AddressPage;