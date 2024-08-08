import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, File } from 'formidable'
import fs from 'fs'
import axios from 'axios'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const form = new IncomingForm()
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing form data' })
    }

    const file = Array.isArray(files.image) ? files.image[0] : files.image
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    try {
      const imageBuffer = fs.readFileSync(file.filepath)
      const base64Image = imageBuffer.toString('base64')

      const response = await axios.post('https://freeimage.host/api/1/upload', {
        key: process.env.FREEIMAGE_API_KEY,
        action: 'upload',
        source: base64Image,
        format: 'json',
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      if (response.data.status_code !== 200) {
        throw new Error(response.data.status_txt || 'Image upload failed')
      }

      res.status(200).json({ url: response.data.image.url })
    } catch (error) {
      console.error('Error uploading image:', error)
      res.status(500).json({ error: 'Error uploading image' })
    } finally {
      // Clean up the temp file
      fs.unlinkSync(file.filepath)
    }
  })
}