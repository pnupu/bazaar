import { useState, useEffect } from 'react';

export function usePythPrice(priceId: string) {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/fetch-exchange-rate?priceId=${priceId}`);
        const data = await response.json();

        if (response.ok) {
          setExchangeRate(data.price);
        } else {
          setError(data.error);
        }
      } catch (err) {
        console.error('Error fetching exchange rate:', err);
        setError('Failed to fetch exchange rate');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchangeRate();
  }, [priceId]);

  return { exchangeRate, isLoading, error };
}
