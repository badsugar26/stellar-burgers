// components/burger-constructor/burger-constructor.tsx
import { FC, useMemo } from 'react';
import { BurgerConstructorUI } from '@ui';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TIngredient } from '@utils-types';
import { AppDispatch, RootState } from '../../services/store';
import { clearOrder, createOrder } from '../../services/slices/orderSlice';
import { clearConstructor } from '../../services/slices/burgerConstructorSlice';
import { fetchProfileOrders } from '../../services/slices/profileOrdersSlice';

// Определите локальный тип, если нужно
type TConstructorIngredient = TIngredient & { id: string };

export const BurgerConstructor: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { bun, ingredients } = useSelector(
    (state: RootState) => state.burgerConstructor
  );

  const { order, orderRequest, loading } = useSelector(
    (state: RootState) => state.order
  );

  const { user } = useSelector((state: RootState) => state.user);

  const onOrderClick = () => {
    if (!bun || orderRequest) return;

    if (!user) {
      navigate('/login');
      return;
    }

    const ingredientIds = [
      bun._id,
      ...ingredients.map((item) => item._id),
      bun._id
    ];

    // ИЗМЕНИТЕ ЭТУ ЧАСТЬ:
    dispatch(createOrder(ingredientIds))
      .unwrap()
      .then(() => {
        console.log('Заказ успешно создан!');

        // ОБНОВЛЯЕМ ИСТОРИЮ ЗАКАЗОВ ПОЛЬЗОВАТЕЛЯ
        dispatch(fetchProfileOrders());

        // Можно также обновить ленту всех заказов, если есть такой слайс
        // dispatch(fetchFeed()); // если у вас есть feedSlice
      })
      .catch((error) => {
        console.error('Ошибка при создании заказа:', error);
      });
  };

  const closeOrderModal = () => {
    dispatch(clearOrder());
    dispatch(clearConstructor());
  };

  // Используйте правильный тип в reduce
  const price = useMemo(
    () =>
      (bun ? bun.price * 2 : 0) +
      ingredients.reduce(
        (s: number, v: TIngredient) => s + v.price, // Используйте TIngredient
        0
      ),
    [bun, ingredients]
  );

  const constructorItems = {
    bun,
    ingredients
  };

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest || loading}
      constructorItems={constructorItems}
      orderModalData={order}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
