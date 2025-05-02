import type { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';

// Define a more specific type for the AI response
type RebuiltProposal = {
  html?: string;
  suggestions?: string[];
  error?: string;
};

// Define the overall API response type
type RebuildResponse = {
  message?: string;
  error?: string;
  rebuiltContent?: RebuiltProposal;
};

// Initialize OpenAI client
// IMPORTANT: The API key is read from environment variables.
// Ensure AI_PROVIDER_API_KEY (or OPENAI_API_KEY) is set in .env.local or environment.
const openai = new OpenAI({
  apiKey: process.env.AI_PROVIDER_API_KEY || process.env.OPENAI_API_KEY,
});

// Helper function to scrape website content
async function scrapeWebsite(targetUrl: string): Promise<string> {
  try {
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      // Add timeout to prevent hanging requests
      timeout: 10000 // 10 seconds
    });
    if (response.status !== 200) {
      throw new Error(`Failed to fetch URL: Status code ${response.status}`);
    }
    // Basic HTML cleaning (can be expanded)
    const $ = cheerio.load(response.data);
    $('script, style, link[rel="stylesheet"]').remove(); // Remove scripts and styles
    // Consider extracting only meaningful content, e.g., within <body> or <main>
    const bodyHtml = $('body').html();
    return bodyHtml || response.data; // Return body content or full data if body is empty

  } catch (error: unknown) {
    let errorMessage = 'Could not scrape the website.';
    if (error instanceof AxiosError) {
      errorMessage = `Could not scrape the website: ${error.message} (Status: ${error.response?.status})`;
    } else if (error instanceof Error) {
      errorMessage = `Could not scrape the website: ${error.message}`;
    }
    console.error(`Error scraping ${targetUrl}:`, error);
    throw new Error(errorMessage);
  }
}

// Helper function to call OpenAI for rebuilding proposal
async function callAIRebuilder(htmlContent: string): Promise<RebuiltProposal> {
  const apiKey = process.env.AI_PROVIDER_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'placeholder_api_key') {
    console.warn('AI API Key is missing or is a placeholder. Returning placeholder response.');
    return {
      html: `<h1>Rebuilt Placeholder</h1><p>AI integration pending API key. Scraped content length: ${htmlContent.length}</p>`,
      suggestions: ['Add a valid API key to enable AI processing.'],
    };
  }

  // Simple prompt - can be significantly improved
  const prompt = `Analyze the following HTML content from an outdated website. Propose a modern, SEO-optimized structure and content. Focus on the main content and purpose. Output the rebuilt HTML structure within a single code block. 

HTML Content:
---
${htmlContent.substring(0, 15000)} 
---

Rebuilt HTML Proposal:`; // Limit input length

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Or a more advanced model like gpt-4 if available/needed
      messages: [
        { role: 'system', content: 'You are an expert web developer tasked with modernizing outdated websites.' },
        { role: 'user', content: prompt },
      ],
      // max_tokens: 1500, // Adjust as needed
    });

    const rebuiltHtml = completion.choices[0]?.message?.content?.trim() || '';

    // Basic extraction assuming AI outputs HTML in a code block or directly
    // Replace /s flag with [\]s\S] to match newlines
    const htmlMatch = rebuiltHtml.match(/```html\n([\s\S]*?)```/) || rebuiltHtml.match(/```\n([\s\S]*?)```/);
    const extractedHtml = htmlMatch ? htmlMatch[1] : rebuiltHtml;

    if (!extractedHtml) {
      throw new Error('AI did not return valid HTML content.');
    }

    return {
      html: extractedHtml,
      suggestions: ['Review and refine the generated HTML.', 'Consider adding specific components based on original site functionality.'],
    };
  } catch (error: unknown) {
    let errorMessage = 'Failed to get proposal from AI.';
    if (error instanceof OpenAI.APIError) {
        errorMessage = `Failed to get proposal from AI: ${error.status} ${error.name} ${error.message}`;
    } else if (error instanceof Error) {
        errorMessage = `Failed to get proposal from AI: ${error.message}`;
    }
    console.error('Error calling OpenAI API:', error);
    return {
      error: errorMessage
    };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RebuildResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required in the request body' });
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return res.status(400).json({ error: 'Invalid URL format. Please include http:// or https://' });
  }

  console.log(`Received request to rebuild URL: ${url}`);

  try {
    // --- Scrape Website --- 
    console.log(`Scraping content from ${url}...`);
    const scrapedHtml = await scrapeWebsite(url);
    console.log(`Successfully scraped content from ${url}. Length: ${scrapedHtml.length}`);

    // --- Call AI for Rebuilding --- 
    console.log(`Sending scraped content to AI for rebuilding...`);
    const rebuiltProposal = await callAIRebuilder(scrapedHtml);

    if (rebuiltProposal.error) {
      // If AI call failed but scraping succeeded, maybe return partial success?
      // For now, treat as overall failure.
      throw new Error(rebuiltProposal.error);
    }

    console.log(`Successfully generated rebuilt proposal for ${url}`);
    res.status(200).json({ message: 'Rebuild request processed successfully.', rebuiltContent: rebuiltProposal });

  } catch (error: unknown) {
    let errorMessage = 'Failed to process rebuild request.';
    if (error instanceof Error) {
        errorMessage = `Failed to process rebuild request: ${error.message}`;
    }
    console.error('Error processing rebuild request:', error);
    // Distinguish between scraping errors and AI errors if needed
    res.status(500).json({ error: errorMessage });
  }
}

