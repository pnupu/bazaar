import { trpc } from './trpc';

export const useCategories = () => {
  return trpc.getCategories.useQuery();
};

export const useItems = () => {
  return trpc.getItems.useQuery();
};

export const useItem = (id: string) => {
  return trpc.getItem.useQuery({ id });
};

export const useCreateItem = () => {
  return trpc.createItem.useMutation();
};