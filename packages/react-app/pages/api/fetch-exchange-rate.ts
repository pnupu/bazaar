import type { NextApiRequest, NextApiResponse } from 'next';
import { PriceServiceConnection } from '@pythnetwork/price-service-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { priceId } = req.query;

  if (!priceId || typeof priceId !== 'string') {
    return res.status(400).json({ error: 'Price ID is required and must be a string' });
  }

  try {
    // Connect to the Pyth Hermes service
    const connection = new PriceServiceConnection("https://hermes.pyth.network");

    // Fetch the latest price for the given priceId
    const priceFeeds = await connection.getLatestPriceFeeds([priceId]);

    if (priceFeeds!.length === 0) {
      return res.status(404).json({ error: 'Price feed not found' });
    }

    const priceFeed = priceFeeds![0];
    // console.log(priceFeed["emaPrice"], " priceFeed")
    const priceData = priceFeed["emaPrice"]; // Get price within the last 60 seconds

    if (!priceData) {
      return res.status(404).json({ error: 'No recent price data available' });
    }

    const adjustedPrice = parseFloat(priceData.price) * Math.pow(10, priceData.expo);

    res.status(200).json({ price: adjustedPrice });
  } catch (error) {
    console.error('Error fetching Pyth price:', error);
    res.status(500).json({ error: 'Failed to fetch Pyth price' });
  }
}
