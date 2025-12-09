import { FC, useEffect } from 'react';
import { Preloader } from '../ui/preloader';
import { IngredientDetailsUI } from '../ui/ingredient-details';
import { useDispatch, useSelector } from '../../services/store';
import { useParams } from 'react-router-dom';
import { setCurrentIngredient } from '../../services/slices/ingredientsSlice';

export const IngredientDetails: FC = () => {
  /** TODO: взять переменную из стора */
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();

  // Правильно получаем данные из store
  const { items, currentIngredient, loading } = useSelector(
    (state) => state.ingredients
  );

  useEffect(() => {
    // Устанавливаем текущий ингредиент по ID
    if (id && items.length > 0) {
      const ingredient = items.find((item) => item._id === id);
      if (ingredient) {
        dispatch(setCurrentIngredient(ingredient));
      }
    }
  }, [id, items, dispatch]);

  // Показываем лоадер при загрузке
  if (loading) {
    return <Preloader />;
  }

  // Сначала проверяем currentIngredient, потом ищем в items
  const ingredient = currentIngredient || items.find((item) => item._id === id);

  if (!ingredient) {
    return <div>Ингредиент не найден</div>;
  }

  return <IngredientDetailsUI ingredientData={ingredient} />;
};
