import { FC, memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { BurgerIngredientUI } from '@ui';
import { TBurgerIngredientProps } from './type';
import { useDispatch, useSelector } from '../../services/store';
import {
  addBun,
  addIngredient
} from '../../services/slices/burgerConstructorSlice';

export const BurgerIngredient: FC<TBurgerIngredientProps> = memo(
  ({ ingredient, count }) => {
    const location = useLocation();
    const dispatch = useDispatch();

    const handleAdd = () => {
      if (ingredient.type === 'bun') {
        dispatch(addBun(ingredient));
      } else {
        dispatch(addIngredient(ingredient));
      }
    };

    const { bun, ingredients: constructorIngredients } = useSelector(
      (state) => state.burgerConstructor
    );

    const actualCount = () => {
      let counter = 0;

      // Считаем начинки
      constructorIngredients.forEach((item) => {
        if (item._id === ingredient._id) {
          counter++;
        }
      });

      // Считаем булку (всегда 2)
      if (bun && bun._id === ingredient._id) {
        counter = 2;
      }

      return counter;
    };

    return (
      <BurgerIngredientUI
        ingredient={ingredient}
        count={actualCount()}
        locationState={{ background: location }}
        handleAdd={handleAdd}
      />
    );
  }
);
