# О сайте Kron

## Техническая информация

- **Backend API**: [GraphQL API](https://api.tovari-kron.ru/v1/graphql)

  - Живой, работающий backend для онлайн-магазина
  - Существует мобильное приложение для этого магазина

- **Frontend**:
  - Создается как веб-сайт
  - Технический стек: Next.js 15, TypeScript, Apollo Client, TailwindCSS
  - Оптимизирован для деплоя на Vercel

## Реализованные возможности и улучшения

### Основные компоненты:

1. **Система уведомлений**

   - Универсальный интерфейс для уведомлений пользователя
   - Типы: успех, ошибка, информация, предупреждение
   - Автоматическое исчезновение через заданное время

2. **История просмотров**

   - Локальная реализация через localStorage
   - Отображение на странице товара в блоке "Недавно просмотренные"
   - Лимит хранения последних 10 товаров

3. **Рекомендации товаров**

   - На основе истории просмотров
   - Показ похожих товаров той же категории

4. **Улучшенная корзина**

   - Унифицированный интерфейс для гостей и авторизованных пользователей
   - Сохранение состояния между сессиями для гостей
   - Синхронизация при авторизации пользователя

5. **Оптимизация производительности**

   - Мемоизация компонентов и функций для снижения перерисовок
   - Оптимизация изображений с поддержкой WebP формата
   - Ленивая загрузка компонентов
   - Кэширование ответов GraphQL

6. **Настройки доступности**
   - Регулировка размера шрифта
   - Увеличение контрастности
   - Улучшенная навигация с клавиатуры

### Улучшения пользовательского интерфейса:

1. **Адаптивная галерея изображений товара**

   - Просмотр в полноэкранном режиме
   - Масштабирование изображений
   - Responsive-дизайн для мобильных устройств

2. **Улучшенные компоненты каталога**

   - Анимированные карточки товаров с визуальной обратной связью
   - Бесконечная прокрутка с оптимизацией для мобильных устройств
   - Фильтры с мобильной версией

3. **Обработка ошибок**

   - Пользовательские страницы ошибок (404, 500)
   - Информативные сообщения о проблемах с API
   - Перехват и логирование ошибок

4. **Безопасность**
   - Безопасное хранение токенов
   - Защита от XSS-атак
   - Валидация данных на клиенте

## Ограничения и особенности

### Что отсутствует и не будет реализовано:

1. Скидки, акции, промокоды
2. Возврат товара
3. Интеграции со службами доставки
4. Детальные характеристики товаров (размеры и т.д.)
   - Вся информация о товаре представлена в виде текстового описания
5. Старые цены и скидки
6. Рейтинг товаров
7. Отзывы о товарах
8. Сравнение товаров
9. Избранные товары
10. ~~История просмотров (можно реализовать локально через localStorage, но с ограничениями) (РЕАЛИЗУЙ!)~~ - Реализовано!
11. ~~Рекомендации товаров (можно реализовать локально через localStorage, но с ограничениями) (РЕАЛИЗУЙ!)~~ - Реализовано!
12. Рассылки и уведомления
13. Бонусные программы
14. Подарочные сертификаты
15. Подарки к покупке
16. Промокоды на доставку
17. Программа лояльности
18. Кэшбэк
19. Партнерская программа
20. Многовалютность
21. Экспорт/импорт товаров
22. API для внешних систем
23. Интеграция с маркетплейсами
24. Мобильная версия сайта (отдельная от десктопной)
25. Чат с поддержкой
26. Форум или сообщество
27. Блог
28. Новости
29. Акции и спецпредложения
30. Распродажи
31. Предзаказ товаров
32. Уведомления о поступлении
33. Подарочная упаковка
34. Подарочные карты
35. Подарки к праздникам
36. Специальные цены для оптовиков
37. Дропшиппинг
38. Аукционы
39. Торги
40. Обмен товаров
41. Аренда товаров
42. Пробные версии
43. Подарки за отзывы
44. Реферальная программа
45. Подарки за регистрацию
46. Подарки за день рождения
47. Подарки за покупку
48. Подарки за отзыв
49. Подарки за репост
50. Подарки за подписку

## Локальные возможности (реализованные)

### История просмотров

- Реализация через localStorage
- Сохранение последних 10 просмотренных товаров
- Кастомный хук useViewHistory для управления
- Компонент RecentlyViewed для отображения
- Ограничения:
  - История доступна только в рамках одного браузера
  - История очищается при очистке кэша браузера
  - Нет синхронизации между устройствами

### Рекомендации товаров

- Реализация на основе истории просмотров
- Компонент SimilarProducts для отображения похожих товаров
- Фильтрация товаров по той же категории
- Ограничения:
  - Рекомендации основаны только на истории просмотров
  - Нет учета реальных предпочтений пользователя
  - Нет учета популярности товаров

### Система уведомлений

- Провайдер NotificationProvider с контекстом React
- Разные типы уведомлений: успех, ошибка, информация, предупреждение
- Автоматическое исчезновение
- Анимация появления и исчезновения

### Корзина

- Унифицированный интерфейс через CartProvider
- Поддержка гостевой и авторизованной корзины
- Сохранение состояния для гостей в localStorage
- Миграция гостевой корзины при авторизации пользователя
- Оптимистичные обновления UI

## Потенциальные локальные возможности (для будущей реализации)

### 1. Улучшение пользовательского опыта

- Сохранение последнего выбранного региона в localStorage - Реализовано!
- Запоминание предпочтений сортировки и фильтрации
- Сохранение состояния корзины для гостей - Реализовано!
- Кэширование часто просматриваемых товаров - Реализовано!
- Оффлайн-режим для просмотра ранее загруженных товаров

### 2. Персонализация

- Темная/светлая тема
- Настройка размера шрифта - Реализовано!
- Сохранение предпочтений отображения (сетка/список)
- Избранные категории
- Быстрый доступ к часто просматриваемым товарам - Реализовано!

### 3. Улучшение поиска

- История поисковых запросов
- Популярные поисковые запросы (на основе локальной статистики)
- Автодополнение поиска на основе локальной истории
- Сохранение результатов поиска для быстрого доступа

### 4. Улучшение корзины

- Быстрый доступ к недавно добавленным товарам
- Сравнение товаров в корзине
- Создание списков покупок
- Сохранение черновиков заказов

### 5. Улучшение навигации

- Хлебные крошки с историей просмотров
- Быстрый доступ к последним просмотренным категориям
- Сохранение позиции скролла на страницах
- Быстрые фильтры на основе истории просмотров

### 6. Аналитика и статистика

- Локальная статистика просмотров товаров
- Топ просматриваемых категорий
- Время, проведенное на страницах
- Популярные товары по локальной статистике
- Тренды поиска

### 7. Улучшение производительности

- Предзагрузка изображений - Реализовано!
- Кэширование API-ответов - Реализовано!
- Оптимизация загрузки ресурсов - Реализовано!
- Ленивая загрузка компонентов - Реализовано!
- Оптимизация рендеринга списков - Реализовано!

### 8. Улучшение доступности

- Настройка контрастности - Реализовано!
- Увеличение размера интерфейса - Реализовано!
- Горячие клавиши для навигации
- Голосовое управление (через браузерные API)
- Улучшенная навигация с клавиатуры - Реализовано!

### 9. Мультиязычность

- Локальное хранение переводов
- Кэширование переводов
- Автоматическое определение языка
- Сохранение выбранного языка

### 10. Улучшение безопасности

- Локальное шифрование чувствительных данных
- Защита от XSS-атак - Реализовано!
- Валидация данных на клиенте - Реализовано!
- Безопасное хранение токенов - Реализовано!
- Защита от CSRF-атак

### Ограничения локальных возможностей:

1. Данные доступны только в рамках одного браузера
2. Нет синхронизации между устройствами
3. Ограниченный объем хранилища
4. Зависимость от возможностей браузера
5. Нет доступа к серверным данным
6. Нет возможности обновления данных в реальном времени
7. Нет возможности интеграции с внешними сервисами
8. Нет возможности масштабирования
9. Нет возможности резервного копирования
10. Нет возможности восстановления данных

## Контексты сайта

### 1. Авторизация

- Гостевая авторизация
- Зарегистрированные пользователи (User)
- Региональная привязка пользователя при регистрации (неизменяемая)

### 2. Региональная структура

- Два региона: Москва и Ставропольский край
- Строгое разделение между регионами
- Нет возможности:
  - Доставки между регионами
  - Взаимодействия между регионами
  - Изменения региона после регистрации

## Функциональность сайта

### 1. Навигация и отображение товаров

- Бесконечная прокрутка (Inf-scroll)
  - Адаптивная лента товаров
  - Кнопка "Загрузить еще" при достижении конца списка
  - Оптимизированная обработка IntersectionObserver

### 2. Сортировка товаров

- По алфавиту
- По новизне
- По цене (возрастание/убывание)

### 3. Фильтрация товаров

- В наличии
- Все товары
- Фильтрация по категориям
- Мобильная версия фильтров

### 4. Статусы товаров

- В наличии (IN_STOCK)
- Ожидается поступление (IN_STOCK_SOON)
  - Отображается срок ожидания (1-2 недели)
- Нет в наличии (OUT_OF_STOCK)
  - Предложение проверить другие регионы

### 5. Корзина покупок

- Добавление товаров с учетом кратности упаковки
- Изменение количества товаров
- Удаление товаров
- Отображение общей стоимости
- Анимация добавления в корзину
- Уведомления о добавлении товара
- Счетчик товаров в корзине
- Продолжение покупок
- Оформление заказа
- Унифицированная корзина для гостей и пользователей

### 6. Оформление заказа

- Выбор адреса доставки
- Способы оплаты:
  - Банковская карта (онлайн)
  - Наличные при получении
- Способы доставки:
  - Курьерская доставка
  - Самовывоз
- Бесплатная доставка
- Подтверждение заказа
- Перенаправление на страницу заказа

### 7. Заказы

- История заказов
- Детальная информация о заказе:
  - Номер заказа
  - Дата заказа
  - Сумма заказа
  - Способ оплаты
  - Способ доставки
  - Адрес доставки
  - Состав заказа
- Статусы заказа:
  - PENDING (Ожидает обработки)
  - PROCESSING (В обработке)
  - SHIPPED (Отправлен)
  - DELIVERED (Доставлен)
  - CANCELLED (Отменен)
- История статусов заказа

### 8. Профиль пользователя

- Личные данные
- Адреса доставки
- История заказов
- Выход из системы

## Структура данных

### Товары

- Изображения
- Описание (текстовое)
- Цена
- Статус наличия
- Категория
- Кратность упаковки (минимальное количество для заказа)
- Слаг (URL-friendly название)

### Пользователи

- Регион
- История заказов
- Личные данные
- Адреса доставки
- Способ оплаты по умолчанию
- Способ доставки по умолчанию

### Заказы

- Номер заказа
- Состав заказа
- Общая стоимость
- Статус заказа
- Дата создания
- Адрес доставки
- Способ оплаты
- Способ доставки

## Технические особенности

### 1. Региональная система

- При первом посещении сайта пользователь должен выбрать регион (Москва или Ставропольский край)
- Выбор региона сохраняется в localStorage
- После регистрации регион привязывается к аккаунту навсегда
- Все товары и заказы строго привязаны к региону
- Невозможно просматривать или заказывать товары из другого региона
- При смене региона в localStorage происходит полная перезагрузка данных

### 2. Работа с товарами

- Товары загружаются порциями через бесконечную прокрутку
- При скролле вниз автоматически подгружаются новые товары
- Фильтрация по наличию работает на стороне API
- Сортировка применяется к уже загруженным товарам
- Каждый товар имеет статус наличия:
  - IN_STOCK: можно добавить в корзину
  - IN_STOCK_SOON: нельзя добавить в корзину, показывается срок ожидания
  - OUT_OF_STOCK: нельзя добавить в корзину, предлагается проверить другой регион

### 3. Корзина

- Корзина привязана к сессии пользователя
- Для гостей корзина хранится в localStorage
- Для авторизованных пользователей корзина синхронизируется с сервером
- При добавлении товара:
  - Проверяется кратность упаковки
  - Если товар уже в корзине, увеличивается количество
  - Показывается анимация и уведомление
- При изменении количества:
  - Проверяется кратность упаковки
  - Обновляется общая стоимость
- При удалении товара:
  - Товар удаляется из корзины
  - Обновляется общая стоимость
  - Обновляется счетчик товаров

### 4. Оформление заказа

- Проверка авторизации пользователя
- Валидация данных:
  - Обязательный выбор адреса доставки
  - Проверка наличия товаров
  - Проверка кратности упаковки
- Процесс оформления:
  1. Выбор адреса доставки
  2. Выбор способа оплаты
  3. Выбор способа доставки
  4. Подтверждение заказа
  5. Создание заказа на сервере
  6. Очистка корзины
  7. Перенаправление на страницу заказа

### 5. Система заказов

- Заказы доступны только авторизованным пользователям
- История заказов отображается в хронологическом порядке
- Статусы заказа:
  - PENDING: заказ создан, ожидает обработки
  - PROCESSING: заказ принят в работу
  - SHIPPED: заказ передан в доставку
  - DELIVERED: заказ доставлен
  - CANCELLED: заказ отменен
- Каждый статус сопровождается:
  - Визуальным индикатором
  - Датой изменения
  - Описанием статуса

### 6. Система доступности

- Компонент AccessibilitySettings для настройки доступности
- Изменение размера шрифта
- Увеличение контрастности
- Настройки сохраняются в localStorage

### 7. Технические особенности

- GraphQL API для всех запросов с обработкой ошибок
- Apollo Client для управления состоянием и кэшированием
- Мемоизация компонентов и хуков для предотвращения лишних рендеров
- Оптимизация изображений с использованием WebP формата
- Безопасный доступ к клиентским API (localStorage, window)
- Улучшенная обработка ошибок с информативными сообщениями
- Адаптивный дизайн для всех устройств
- Оптимизация для развертывания на Vercel
- Server-side rendering с учетом гидратации
