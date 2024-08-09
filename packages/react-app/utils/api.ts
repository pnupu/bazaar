import { trpc } from './trpc';


export const useItems = () => {
  return trpc.items.getItems.useQuery();
};

export const useItem = (id: string) => {
  return trpc.items.getItem.useQuery({ id });
};

export const useCreateItem = () => {
  return trpc.items.createItem.useMutation();
};

export const useSearchItems = (query: string) => {
  return trpc.items.searchItems.useQuery({ query }, { enabled: !!query });
};

export const useUpdateItem = () => {
  return trpc.items.updateItem.useMutation();
};

export const useUpdateItemStatus = () => {
  return trpc.items.updateItemStatus.useMutation();
};