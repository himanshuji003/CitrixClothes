// Shopify Storefront API GraphQL queries (2024-10)

export const PRODUCTS_QUERY = /* GraphQL */ `
  query Products($first: Int = 24) {
    products(first: $first) {
      edges { node {
        id handle title description tags
        priceRange { minVariantPrice { amount currencyCode } }
        compareAtPriceRange { minVariantPrice { amount currencyCode } }
        images(first: 4) { edges { node { url altText } } }
        variants(first: 25) { edges { node { id title availableForSale selectedOptions { name value } } } }
      } }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query Product($handle: String!) {
    productByHandle(handle: $handle) {
      id handle title description tags
      priceRange { minVariantPrice { amount currencyCode } }
      compareAtPriceRange { minVariantPrice { amount currencyCode } }
      images(first: 8) { edges { node { url altText } } }
      variants(first: 25) { edges { node { id title availableForSale selectedOptions { name value } } } }
    }
  }
`;

export const COLLECTIONS_QUERY = /* GraphQL */ `
  query Collections($first: Int = 12) {
    collections(first: $first) {
      edges { node { id handle title description image { url altText } } }
    }
  }
`;

export const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart { id checkoutUrl totalQuantity }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { id checkoutUrl totalQuantity }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id checkoutUrl totalQuantity }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id checkoutUrl totalQuantity }
      userErrors { field message }
    }
  }
`;
