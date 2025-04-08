<tbody className="bg-white divide-y divide-gray-200">
  {filteredOrders.map((order) => {
    const status = getStatusLabel(order.status as OrderStatus);
    return (
      <tr key={order.id} className="hover:bg-gray-50">
        // ... existing code ...
      </tr>
    );
  })}
</tbody>;
