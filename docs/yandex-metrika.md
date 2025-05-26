# Yandex.Metrika Integration

This document provides information about the Yandex.Metrika integration in our Next.js e-commerce application.

## Overview

Yandex.Metrika is integrated to track visitor statistics and user behavior. The implementation includes:

1. Basic page view tracking
2. Custom event tracking
3. E-commerce tracking (for orders)

## Configuration

The Yandex.Metrika counter ID is stored in environment variables:

```
NEXT_PUBLIC_YANDEX_METRIKA_ID=12345678
```

To configure for production, update the `.env.production` file with your actual Yandex.Metrika counter ID.

## Components

### YandexMetrika Component

The main component for Yandex.Metrika integration is located at:

```
src/components/analytics/YandexMetrika.tsx
```

This component:

- Adds the Yandex.Metrika tracking code to the site
- Handles SPA page view tracking
- Provides fallback tracking via `<noscript>` tag

The component is included in the root layout file:

```
src/app/layout.tsx
```

## Utility Functions

Analytics utility functions are located at:

```
src/lib/analytics.ts
```

### Available Functions

#### `trackEvent(eventName, parameters)`

Tracks custom events in Yandex.Metrika.

```typescript
import { trackEvent } from '@/lib/analytics';

// Track a custom event
trackEvent('button_click', { button_name: 'add_to_cart' });
```

#### `trackPageView(url, options)`

Manually tracks page views (useful for virtual pages).

```typescript
import { trackPageView } from '@/lib/analytics';

// Track a virtual page view
trackPageView('/virtual-page');
```

#### `trackOrder(orderId, items, total)`

Tracks completed orders for e-commerce analytics.

```typescript
import { trackOrder } from '@/lib/analytics';

// Track a completed order
trackOrder(
  'order-123',
  [
    {
      id: 'product-1',
      name: 'Product Name',
      price: 100,
      quantity: 2,
      category: 'Category Name',
    },
  ],
  200
);
```

## Usage Examples

### Tracking Order Completion

Order tracking is automatically implemented in the checkout process:

```
src/app/checkout/page.tsx
```

### Tracking Product Views

To track product views, add the following to product pages:

```typescript
import { trackEvent } from '@/lib/analytics';

// Inside your product page component
useEffect(() => {
  trackEvent('product_view', {
    product_id: product.id,
    product_name: product.name,
    product_price: product.price,
  });
}, [product]);
```

## Testing

To verify the Yandex.Metrika integration:

1. Open the site in a browser
2. Open browser developer tools
3. Check for Yandex.Metrika requests in the Network tab
4. Use Yandex.Metrika real-time reports to confirm data collection

## Troubleshooting

### No data in Yandex.Metrika

- Verify the counter ID is correct in the environment variables
- Check browser console for errors
- Ensure no ad-blockers are preventing the tracking script

### SPA Page Views Not Tracking

If page changes are not being tracked in a single-page application:

- Ensure the route change event listeners are properly connected
- Check that the router events are being properly captured
