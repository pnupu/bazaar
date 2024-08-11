import { useCeloExchangeRate } from './useCeloExchangeRate';

export const useConvertPrice = () => {
  const { exchangeRate1, isLoading, error } = useCeloExchangeRate();

  const convert = (amount: number, fromCurrency: 'USD' | 'EUR', toCurrency: 'USD' | 'EUR') => {
    if (fromCurrency === toCurrency) return { value: amount, isLoading: false, error: null };
    if (isLoading) return { value: null, isLoading: true, error: null };
    if (error) return { value: null, isLoading: false, error: error };
    if (!exchangeRate1) return { value: null, isLoading: false, error: "Exchange rate unavailable" };

    let convertedAmount;
    if (fromCurrency === 'USD' && toCurrency === 'EUR') {
      convertedAmount = amount / exchangeRate1;
    } else {
      convertedAmount = amount * exchangeRate1;
    }

    return { value: convertedAmount, isLoading: false, error: null };
  };

  return convert;
};