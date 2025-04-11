// ВАЖНО: Этот файл устарел и оставлен для совместимости.
// Используйте импорт из apollo-client.ts вместо этого файла
import { client as apolloClient } from "./apollo-client";

// Реэкспортируем клиент из apollo-client.ts для совместимости
export const getClient = () => apolloClient;

export default getClient;
