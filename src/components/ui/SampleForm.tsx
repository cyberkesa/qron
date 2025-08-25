'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  name: z.string().min(2, 'Введите не менее 2 символов'),
  email: z.string().email('Введите корректный email'),
  phone: z
    .string()
    .regex(/^\+?\d[\d\s()-]{9,}$/u, 'Введите корректный номер телефона'),
});

type FormValues = z.infer<typeof schema>;

export function SampleForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: 'onBlur' });

  const onSubmit = async (values: FormValues) => {
    await new Promise((r) => setTimeout(r, 400));
    alert(JSON.stringify(values, null, 2));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-fg">Имя</label>
        <input
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-fg placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          placeholder="Ваше имя"
          {...register('name')}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-fg">Email</label>
        <input
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-fg placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          placeholder="you@example.com"
          inputMode="email"
          {...register('email')}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-fg">Телефон</label>
        <input
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-fg placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          placeholder="+7 (900) 000-00-00"
          inputMode="tel"
          {...register('phone')}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
      >
        Отправить
      </button>
    </form>
  );
}

export default SampleForm;
