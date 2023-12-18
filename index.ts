const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0";

interface FetchPageProps {
  search: string;
  page: number;
}

const fetchPage = async ({
  search,
  page,
}: FetchPageProps): Promise<Record<string, unknown>> => {
  const offset = (page - 1) * 40;
  const size = 80;

  const url = new URL(
    "https://www2.hm.com/es_mx/search-results/_jcr_content/search.display.json"
  );

  url.searchParams.append("q", search);
  url.searchParams.append("department", "1");
  url.searchParams.append("sort", "stock");
  url.searchParams.append("image-size", "small");
  url.searchParams.append("image", "stillLife");
  url.searchParams.append("offset", offset.toString());
  url.searchParams.append("page-size", size.toString());

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json, text/javascript, */*; q=0.01",
      "Accept-Language": "en-US,en;q=0.5",
      "X-Requested-With": "XMLHttpRequest",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      Referer: `https://www2.hm.com/es_mx/search-results.html?q=${search}&sort=stock&image-size=small&image=stillLife&offset=0&page-size=${size}`,
    },
  });

  const content = await response.json();

  return content as Record<string, unknown>;
};

const parseLinkToUrl = (link: string) => {
  const url = new URL(link, "https://www2.hm.com/es_mx");

  return url.toString();
};

const parsePageResult = (pageResult: Record<string, unknown>) => {
  const rawProducts = pageResult.products as Record<string, unknown>[];

  const products = rawProducts.map((rawProduct) => ({
    id: rawProduct.articleCode,
    name: rawProduct.title,
    price: rawProduct.price,
    link: parseLinkToUrl(rawProduct.link as string),
  }));

  return products;
};

const main = async () => {
  const [rawSearch] = process.argv.slice(2);

  const search = rawSearch ? rawSearch : "zapatos";

  const pageResult = await fetchPage({ search, page: 1 });

  const results = parsePageResult(pageResult);

  console.log(JSON.stringify(results, null, 2));
};

main()
  .then(() => {
    process.exit(1);
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
