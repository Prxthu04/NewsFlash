const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2/everything';

export const getTopHeadlines = async (category = '', page = 1) => {
  try {
    const url = `https://newsapi.org/v2/everything?q=${category}&pageSize=10&page=${page}&apiKey=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log('Headlines:', data);
    return data.articles || [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

export const searchNews = async (query, page = 1) => {
  try {
    const url = `${BASE_URL}/everything?q=${encodeURIComponent(
      query
    )}&pageSize=10&page=${page}&sortBy=publishedAt&apiKey=${API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();
    console.log('Search Results:', data); // ✅ DEBUG LOG

    return data.articles || [];
  } catch (error) {
    console.error('Error searching news:', error);
    return [];
  }
};
