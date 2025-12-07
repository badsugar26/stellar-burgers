import { ProfileOrdersUI } from '@ui-pages';
import { TOrder } from '@utils-types';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfileOrders } from '../../services/slices/profileOrdersSlice';
import { AppDispatch, RootState } from '../../services/store';

export const ProfileOrders: FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { orders } = useSelector((state: RootState) => state.profileOrders);

  useEffect(() => {
    dispatch(fetchProfileOrders());
  }, [dispatch]);

  return <ProfileOrdersUI orders={orders} />;
};
