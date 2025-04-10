import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
  query GetProducts(
    $after: String
    $first: Int!
    $sortOrder: ProductSortOrder!
    $searchQuery: String
    $categoryId: ID
  ) {
    products(
      after: $after
      first: $first
      sortOrder: $sortOrder
      searchQuery: $searchQuery
      categoryId: $categoryId
    ) {
      edges {
        cursor
        node {
          id
          name
          description
          price
          images {
            id
            url
          }
          slug
          category {
            id
            title
            slug
            ... on NonRootLeafCategory {
              ancestors {
                id
                title
                slug
              }
              parent {
                id
                title
                slug
              }
            }
            ... on RootLeafCategory {
              iconUrl
            }
          }
          stockAvailabilityStatus
          quantityMultiplicity
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    rootCategories {
      id
      title
      slug
      ... on RootBranchCategory {
        iconUrl
      }
      ... on RootLeafCategory {
        iconUrl
      }
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($slug: String!) {
    productBySlug(slug: $slug) {
      id
      name
      description
      price
      images {
        id
        url
      }
      slug
      category {
        id
        title
        slug
        ... on NonRootLeafCategory {
          ancestors {
            id
            title
            slug
          }
          parent {
            id
            title
            slug
          }
        }
        ... on RootLeafCategory {
          iconUrl
        }
      }
      stockAvailabilityStatus
      quantityMultiplicity
    }
  }
`;

export const GET_CART = gql`
  query GetCart {
    cart {
      id
      items(first: 100) {
        edges {
          node {
            id
            product {
              id
              name
              description
              price
              images {
                id
                url
              }
              slug
              category {
                id
                title
                slug
                ... on NonRootLeafCategory {
                  ancestors {
                    id
                    title
                    slug
                  }
                  parent {
                    id
                    title
                    slug
                  }
                }
                ... on RootLeafCategory {
                  iconUrl
                }
              }
              stockAvailabilityStatus
              quantityMultiplicity
            }
            quantity
          }
        }
        decimalTotalPrice
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const ADD_TO_CART = gql`
  mutation AddToCart($productId: ID!, $quantity: Int!) {
    updateCartItemQuantity(productId: $productId, quantity: $quantity) {
      ... on UpdateCartItemQuantitySuccessResult {
        cart {
          id
          items(first: 100) {
            edges {
              node {
                id
                product {
                  id
                  name
                  description
                  price
                  images {
                    id
                    url
                  }
                  slug
                  category {
                    id
                    title
                    slug
                    ... on NonRootLeafCategory {
                      ancestors {
                        id
                        title
                        slug
                      }
                      parent {
                        id
                        title
                        slug
                      }
                    }
                    ... on RootLeafCategory {
                      iconUrl
                    }
                  }
                  stockAvailabilityStatus
                  quantityMultiplicity
                }
                quantity
              }
            }
            decimalTotalPrice
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    }
  }
`;

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($productId: ID!) {
    updateCartItemQuantity(productId: $productId, quantity: 0) {
      ... on UpdateCartItemQuantitySuccessResult {
        cart {
          id
          items(first: 100) {
            edges {
              node {
                id
                product {
                  id
                  name
                  description
                  price
                  images {
                    id
                    url
                  }
                  slug
                  category {
                    id
                    title
                    slug
                    ... on NonRootLeafCategory {
                      ancestors {
                        id
                        title
                        slug
                      }
                      parent {
                        id
                        title
                        slug
                      }
                    }
                    ... on RootLeafCategory {
                      iconUrl
                    }
                  }
                  stockAvailabilityStatus
                  quantityMultiplicity
                }
                quantity
              }
            }
            decimalTotalPrice
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    }
  }
`;

export const UPDATE_CART_ITEM_QUANTITY = gql`
  mutation UpdateCartItemQuantity($productId: ID!, $quantity: Int!) {
    updateCartItemQuantity(productId: $productId, quantity: $quantity) {
      ... on UpdateCartItemQuantitySuccessResult {
        cart {
          id
          items(first: 100) {
            edges {
              node {
                id
                product {
                  id
                  name
                  description
                  price
                  images {
                    id
                    url
                  }
                  slug
                  category {
                    id
                    title
                    slug
                    ... on NonRootLeafCategory {
                      ancestors {
                        id
                        title
                        slug
                      }
                      parent {
                        id
                        title
                        slug
                      }
                    }
                    ... on RootLeafCategory {
                      iconUrl
                    }
                  }
                  stockAvailabilityStatus
                  quantityMultiplicity
                }
                quantity
              }
            }
            decimalTotalPrice
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    }
  }
`;

// Запросы для получения истории заказов
export const GET_ORDERS = gql`
  query GetOrders($first: Int, $after: String) {
    orders(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          status
          creationDatetime
          items {
            edges {
              node {
                id
                quantity
                decimalUnitPrice
                product {
                  id
                  name
                  images {
                    id
                    url
                  }
                }
              }
            }
            totalQuantity
            decimalTotalPrice
          }
          deliveryFullAddress
          number
          phoneNumber
          region {
            id
            name
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// Запрос для получения информации о конкретном заказе
export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      status
      creationDatetime
      items {
        edges {
          node {
            id
            quantity
            decimalUnitPrice
            product {
              id
              name
              images {
                id
                url
              }
              slug
            }
          }
        }
        totalQuantity
        decimalTotalPrice
      }
      deliveryFullAddress
      number
      phoneNumber
      region {
        id
        name
      }
    }
  }
`;

// Запрос для получения адресов доставки
export const GET_DELIVERY_ADDRESSES = gql`
  query GetDeliveryAddresses {
    deliveryAddresses {
      id
      fullAddress
    }
  }
`;

// Мутация для оформления заказа
export const CHECK_OUT = gql`
  mutation CheckOut(
    $deliveryAddressId: ID!
    $paymentMethod: PaymentMethod!
    $deliveryMethod: DeliveryMethod!
  ) {
    checkOut(
      deliveryAddressId: $deliveryAddressId
      paymentMethod: $paymentMethod
      deliveryMethod: $deliveryMethod
    ) {
      ... on CheckOutSuccessResult {
        order {
          id
          status
          creationDatetime
          items {
            edges {
              node {
                id
                quantity
                decimalUnitPrice
                product {
                  id
                  name
                  images {
                    id
                    url
                  }
                }
              }
            }
            totalQuantity
            decimalTotalPrice
          }
          deliveryFullAddress
          number
          phoneNumber
          region {
            id
            name
          }
        }
      }
      ... on UnexpectedError {
        message
      }
    }
  }
`;

// Мутация для создания адреса доставки
export const CREATE_DELIVERY_ADDRESS = gql`
  mutation CreateDeliveryAddress($fullAddress: String!) {
    addDeliveryAddress(fullAddress: $fullAddress) {
      ... on AddDeliveryAddressSuccessResult {
        deliveryAddress {
          id
          fullAddress
        }
      }
      ... on UnexpectedError {
        message
      }
    }
  }
`;

// Мутация для удаления адреса доставки
export const DELETE_DELIVERY_ADDRESS = gql`
  mutation DeleteDeliveryAddress($id: ID!) {
    deleteDeliveryAddress(id: $id) {
      ... on DeleteDeliveryAddressSuccessResult {
        nothing
      }
      ... on UnexpectedError {
        message
      }
    }
  }
`;

// Аутентификация
export const LOGIN = gql`
  mutation LogIn($email: String!, $password: String!) {
    logIn(emailAddress: $email, password: $password) {
      ... on LogInSuccessResult {
        accessToken
        refreshToken
      }
      ... on LogInErrorDueToAccountNotFound {
        message
      }
      ... on LogInErrorDueToWrongPassword {
        message
      }
      ... on UnexpectedError {
        message
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      ... on RegisterSuccessResult {
        nothing
      }
      ... on UnexpectedError {
        message
      }
    }
  }
`;

export const LOGOUT = gql`
  mutation LogOut {
    logOut {
      ... on LogOutSuccessResult {
        nothing
      }
      ... on UnexpectedError {
        message
      }
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshAccessToken(refreshToken: $refreshToken) {
      ... on RefreshAccessTokenSuccessResult {
        accessToken
        refreshToken
      }
      ... on RefreshAccessTokenError {
        message
      }
      ... on UnexpectedError {
        message
      }
    }
  }
`;

// Данные пользователя
export const GET_VIEWER = gql`
  query GetViewer {
    viewer {
      ... on RegisteredViewer {
        id
        emailAddress
        name
        phoneNumber
        region {
          id
          name
        }
      }
      ... on AnonymousViewer {
        id
        region {
          id
          name
        }
      }
    }
  }
`;

// Query for getting best deal products
export const GET_BEST_DEAL_PRODUCTS = gql`
  query GetBestDealProducts {
    bestDealProducts {
      id
      name
      description
      price
      images {
        id
        url
      }
      slug
      category {
        id
        title
        slug
        ... on NonRootLeafCategory {
          ancestors {
            id
            title
            slug
          }
          parent {
            id
            title
            slug
          }
        }
        ... on RootLeafCategory {
          iconUrl
        }
      }
      stockAvailabilityStatus
    }
  }
`;

// Регионы
export const GET_REGIONS = gql`
  query GetRegions {
    regions {
      id
      name
    }
  }
`;

export const GET_CURRENT_REGION = gql`
  query GetCurrentRegion {
    viewer {
      ... on AnonymousViewer {
        region {
          id
          name
        }
      }
      ... on RegisteredViewer {
        region {
          id
          name
        }
      }
    }
  }
`;

export const LOGIN_AS_GUEST = gql`
  mutation LoginAsGuest($regionId: ID!) {
    logInAsGuest(regionId: $regionId) {
      ... on LogInAsGuestSuccessResult {
        accessToken
        refreshToken
      }
      ... on UnexpectedError {
        message
      }
    }
  }
`;

export const GET_CATEGORY_BY_SLUG = gql`
  query GetCategoryBySlug($slug: String!) {
    categoryBySlug(slug: $slug) {
      id
      title
      slug
      ... on RootBranchCategory {
        iconUrl
        children {
          id
          title
          slug
        }
      }
      ... on RootLeafCategory {
        iconUrl
      }
      ... on NonRootBranchCategory {
        children {
          id
          title
          slug
        }
        ancestors {
          id
          title
          slug
        }
        parent {
          id
          title
          slug
        }
      }
      ... on NonRootLeafCategory {
        ancestors {
          id
          title
          slug
        }
        parent {
          id
          title
          slug
        }
      }
    }
  }
`;

// Мутация для редактирования адреса доставки
export const EDIT_DELIVERY_ADDRESS = gql`
  mutation EditDeliveryAddress($id: ID!, $fullAddress: String!) {
    editDeliveryAddress(id: $id, fullAddress: $fullAddress) {
      ... on EditDeliveryAddressSuccessResult {
        deliveryAddress {
          id
          fullAddress
        }
      }
      ... on UnexpectedError {
        message
      }
    }
  }
`;

// Запрос для получения адреса доставки по ID
export const GET_DELIVERY_ADDRESS = gql`
  query GetDeliveryAddress($id: ID!) {
    deliveryAddress(id: $id) {
      id
      fullAddress
    }
  }
`;
