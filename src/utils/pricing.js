// Price for a booking.
//  - select service (Imam, Moazzin): price x number of selected items (each namaz / occasion)
//  - package service (Khadim, Cleaning): price x number of persons
// total is null when the service has no rate yet.
export function calcTotal(service, selected = [], people = 1) {
  if (service.price == null) return { count: 0, total: null };
  if (service.mode === 'select') {
    const count = selected.length;
    return { count, total: service.price * count };
  }
  return { count: people, total: service.price * people };
}
