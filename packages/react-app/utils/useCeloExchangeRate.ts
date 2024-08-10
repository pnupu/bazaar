import { usePythPrice } from './usePythPrice';

export const useCeloExchangeRate = () => {
  const eurToUsdPriceId = '0xa995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b'; // EUR/USD price ID from Pyth
  const { exchangeRate, isLoading, error } = usePythPrice(eurToUsdPriceId);

  const exchangeRate1 = exchangeRate ? exchangeRate : null;

  return {
    exchangeRate1,
    isLoading,
    error,
  };
};