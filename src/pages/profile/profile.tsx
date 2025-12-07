import { ProfileUI } from '@ui-pages';
import { FC, SyntheticEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../services/store';
import { updateUser } from '../../services/slices/userSlice';
import { Preloader } from '@ui';

export const Profile: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useSelector(
    (state: RootState) => state.user
  );

  if (loading || !user) {
    return <Preloader />;
  }

  const [formValue, setFormValue] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: ''
  });

  const [originalValues, setOriginalValues] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: ''
  });

  const [localError, setLocalError] = useState<string>('');

  useEffect(() => {
    if (user) {
      const newValues = {
        name: user.name || '',
        email: user.email || '',
        password: ''
      };
      setFormValue(newValues);
      setOriginalValues(newValues);
    }
  }, [user]);

  const isFormChanged =
    formValue.name !== originalValues.name ||
    formValue.email !== originalValues.email ||
    !!formValue.password;

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();

    setLocalError('');

    if (!isFormChanged) return;

    // Подготавливаем данные для отправки
    const updateData: any = {};

    if (formValue.name !== originalValues.name) {
      updateData.name = formValue.name;
    }
    if (formValue.email !== originalValues.email) {
      updateData.email = formValue.email;
    }
    if (formValue.password) {
      updateData.password = formValue.password;
    }

    dispatch(updateUser(updateData))
      .unwrap()
      .then(() => {
        // Успешно обновлено - обновляем оригинальные значения и очищаем пароль
        setOriginalValues({
          name: formValue.name,
          email: formValue.email,
          password: ''
        });
        setFormValue((prev) => ({
          ...prev,
          password: ''
        }));
      })
      .catch((error) => {
        console.error('Update profile error:', error);

        // ИЗМЕНИТЕ ЭТО: используем localError вместо вызова getUser
        if (
          error.message?.includes('You should be authorised') ||
          error.message?.includes('jwt')
        ) {
          setLocalError('Сессия истекла. Пожалуйста, войдите снова.');
        } else {
          setLocalError(error.message || 'Ошибка обновления профиля');
        }
      });
  };

  const handleCancel = (e: SyntheticEvent) => {
    e.preventDefault();

    setLocalError('');

    setFormValue({
      name: originalValues.name,
      email: originalValues.email,
      password: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValue((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));

    if (localError) {
      setLocalError('');
    }
  };

  return (
    <ProfileUI
      formValue={formValue}
      isFormChanged={isFormChanged}
      updateUserError={localError || error || ''}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
    />
  );
};
