import {gql} from '@apollo/client';

export const GET_PRODUCTS = gql`
  query GetProducts(
    $after: String, 
    $first: Int!, 
    $sortOrder: ProductSortOrder!,
    $searchQuery: String
  ) {
    products(
      after: $after, 
      first: $first, 
      sortOrder: $sortOrder,
      searchQuery: $searchQuery
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
  query GetOrders {
    orders {
      edges {
        cursor
        node {
          id
          status
          createdAt
          decimalTotalPrice
          items {
            id
            quantity
            name
            decimalUnitPrice
            imageUrl
          }
          deliveryAddress {
            id
            fullName
            phoneNumber
            address
            city
            postalCode
          }
          paymentMethod
          deliveryMethod
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
      createdAt
      decimalTotalPrice
      items {
        id
        quantity
        name
        decimalUnitPrice
        imageUrl
        product {
          id
          name
          slug
        }
      }
      deliveryAddress {
        id
        fullName
        phoneNumber
        address
        city
        postalCode
      }
      paymentMethod
      deliveryMethod
    }
  }
`;

// Запрос для получения адресов доставки
export const GET_DELIVERY_ADDRESSES = gql`
  query GetDeliveryAddresses {
    deliveryAddresses {
      id
      fullName
      phoneNumber
      address
      city
      postalCode
      isDefault
    }
  }
`;

// Мутация для оформления заказа
export const CHECK_OUT = gql`
  mutation CheckOut($deliveryAddressId: ID!, $paymentMethod: PaymentMethod!, $deliveryMethod: DeliveryMethod!) {
    checkOut(deliveryAddressId: $deliveryAddressId, paymentMethod: $paymentMethod, deliveryMethod: $deliveryMethod) {
      ... on CheckOutSuccessResult {
        order {
          id
          status
          createdAt
          decimalTotalPrice
          items {
            id
            quantity
            name
            decimalUnitPrice
            imageUrl
          }
          deliveryAddress {
            id
            fullName
            phoneNumber
            address
            city
            postalCode
          }
          paymentMethod
          deliveryMethod
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
  mutation CreateDeliveryAddress($input: CreateDeliveryAddressInput!) {
    createDeliveryAddress(input: $input) {
      ... on CreateDeliveryAddressSuccessResult {
        deliveryAddress {
          id
          fullName
          phoneNumber
          address
          city
          postalCode
          isDefault
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
        success
      }
      ... on UnexpectedError {
        message
      }
    }
  }
`;

// Мутация для установки адреса доставки по умолчанию
export const SET_DEFAULT_DELIVERY_ADDRESS = gql`
  mutation SetDefaultDeliveryAddress($id: ID!) {
    setDefaultDeliveryAddress(id: $id) {
      ... on SetDefaultDeliveryAddressSuccessResult {
        deliveryAddress {
          id
          isDefault
        }
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
        accessToken
        refreshToken
      }
      ... on RegisterFailedResult {
        message
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
        success
      }
      ... on UnexpectedError {
        message
      }
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      ... on RefreshTokenSuccessResult {
        accessToken
        refreshToken
      }
      ... on RefreshTokenFailedResult {
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
      id
      ... on RegisteredViewer {
        emailAddress
        name
        phoneNumber
        region {
          id
          name
        }
      }
      ... on AnonymousViewer {
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