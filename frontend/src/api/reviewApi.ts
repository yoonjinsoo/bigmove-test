import axios from 'axios';

interface ReviewData {
  user_id: number;
  order_id: number;
  rating: number;
  comment: string;
}

export const getOrderReviews = async (orderId: number) => {
  const response = await axios.get(`/api/reviews/${orderId}`);
  return response.data;
};

export const submitReview = async (reviewData: ReviewData) => {
  const response = await axios.post('/api/reviews', reviewData);
  return response.data;
};
