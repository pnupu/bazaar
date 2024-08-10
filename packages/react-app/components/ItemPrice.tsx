import { useCurrency } from '../contexts/CurrencyContext';
import { useConvertPrice } from '../utils/currency';

type ItemPriceProps = {
  priceCUSD: number;
};

const ItemPrice: React.FC<ItemPriceProps> = ({ priceCUSD }) => {
  const { currency } = useCurrency();
  const convertPrice = useConvertPrice();

  const { value: displayPrice, isLoading, error } = convertPrice(priceCUSD, 'USD', currency);

  if (isLoading) {
    return <span>Loading price...</span>;
  }

  if (error) {
    return <span>Price unavailable: {error}</span>;
  }

  if (displayPrice === null) {
    return <span>Price unavailable</span>;
  }

  return (
    <span>{currency === 'USD' ? 'USD ' : '€'}{displayPrice.toFixed(2)}</span>
  );
};

export default ItemPrice;